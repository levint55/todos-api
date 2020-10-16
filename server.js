var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db.js");
var middleware = require("./middleware.js")(db);

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("Todo API Root");
});

// GET /todos?completed=false&q=work
app.get("/todos", middleware.requireAuthentication, function (req, res) {
  var query = req.query;
  var where = { userId: req.user.get("id") };

  console.log(req.query);

  if (query.hasOwnProperty("completed") && query.completed === "true") {
    where.completed = true;
  } else if (query.hasOwnProperty("completed") && query.completed === "false") {
    where.completed = false;
  }

  if (query.hasOwnProperty("q") && query.q.length > 0) {
    where.description = {
      $like: "%" + query.q + "%",
    };
  }

  db.todo.findAll({ where: where }).then(
    function (todos) {
      res.json(todos);
    },
    function (e) {
      res.status(500).send();
    }
  );
});

// GET /todos/:id
app.get("/todos/:id", middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);

  db.todo
    .findOne({
      where: {
        id: todoId,
        userId: req.user.get("id"),
      },
    })
    .then(
      function (todo) {
        if (!!todo) {
          res.json(todo.toJSON());
        } else {
          res.status(404).send();
        }
      },
      function (e) {
        res.status(500).send();
      }
    );
});

// POST /todos
app.post("/todos", middleware.requireAuthentication, function (req, res) {
  var body = _.pick(req.body, "description", "completed");

  db.todo.create(body).then(
    function (todo) {
      req.user
        .addTodo(todo)
        .then(() => {
          return todo.reload();
        })
        .then(() => {
          res.json(todo.toJSON());
        });
    },
    function (e) {
      res.status(400).json(e);
    }
  );
});

// DELETE /todos/:id
app.delete("/todos/:id", middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);

  db.todo
    .findOne({
      where: {
        id: todoId,
        userId: req.user.get("id"),
      },
    })
    .then((todo) => {
      if (!!todo) {
        todo.destroy();
        res.status(200).send();
      } else {
        res.status(404).send({
          error: "no todo found with that id",
        });
      }
    })
    .catch((e) => {
      res.status(500).send();
    });
});

// PUT /todos/:id
app.put("/todos/:id", middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var body = _.pick(req.body, "description", "completed");
  var attributes = {};

  if (body.hasOwnProperty("completed")) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty("description")) {
    attributes.description = body.description;
  }

  db.todo
    .findOne({
      where: {
        id: todoId,
        userId: req.user.get("id"),
      },
    })
    .then(
      (todo) => {
        if (todo) {
          todo.update(attributes).then(
            (todo) => {
              res.json(todo.toJSON());
            },
            (e) => {
              res.status(400).json(e);
            }
          );
        } else {
          res.status(404).send();
        }
      },
      () => {
        res.status(500).send();
      }
    );
});

app.post("/users", (req, res) => {
  var body = _.pick(req.body, "email", "password");

  db.user
    .create(body)
    .then(
      function (user) {
        res.json(user.toPublicJSON());
      },
      function (e) {
        res.status(400).json(e);
      }
    )
    .catch((e) => {
      res.status(500).send();
    });
});

app.post("/users/login", (req, res) => {
  var body = _.pick(req.body, "email", "password");
  var userInstance;

  db.user
    .authenticate(body)
    .then((user) => {
      var token = user.generateToken("authentication");
      userInstance = user;
      return db.token.create({
        token: token,
      });
    })
    .then((tokenInstance) => {
      res
        .header("Auth", tokenInstance.get("token"))
        .json(userInstance.toPublicJSON());
    })
    .catch((e) => res.status(401).send());
});

app.delete("/users/login", middleware.requireAuthentication, (req, res) => {
  req.token.destroy().then(
    () => {
      res.status(204).send();
    },
    () => {
      res.status(500).send();
    }
  );
});

db.sequelize.sync({ force: true }).then(function () {
  app.listen(PORT, function () {
    console.log("Express listening on port " + PORT + "!");
  });
});
