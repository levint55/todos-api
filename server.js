var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db.js");

var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Todo API Root");
});

app.get("/todos", (req, res) => {
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty("completed") && query.completed === "true") {
    where.completed = true;
  } else if (query.hasOwnProperty("completed") && query.completed === "false") {
    where.completed = false;
  }

  if (
    query.hasOwnProperty("description") &&
    _.isString(query.description) &&
    query.description.trim().length > 0
  ) {
    where.description = {
      $like: `%${query.description}%`,
    };
  }

  db.todo
    .findAll({ where: where })
    .then((todos) => {
      res.json(todos);
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send();
    });
});

app.get("/todos/:id", (req, res) => {
  var todoId = parseInt(req.params.id, 10);

  db.todo
    .findById(todoId)
    .then((todo) => {
      // dua "!" buat jadiin object jadi truthty
      if (!!todo) {
        res.json(todo.toJSON());
      } else {
        res.status(404).send();
      }
    })
    .catch((e) => {
      res.status(500).send();
    });
});

app.post("/todos", (req, res) => {
  var body = _.pick(req.body, "description", "completed");

  db.todo
    .create(body)
    .then((todo) => {
      return res.json(todo.toJSON());
    })
    .catch((e) => {
      console.log(e);
      return res.status(400).send();
    });
});

app.delete("/todos/:id", (req, res) => {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, { id: todoId });

  if (!matchedTodo) {
    res.status(404).json({ error: "no todo found with that id" });
  } else {
    todos = _.without(todos, matchedTodo);
  }

  res.json(todos);
});

app.put("/todos/:id", (req, res) => {
  var body = _.pick(req.body, "description", "completed");
  var validAttributes = {};
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, { id: todoId });

  if (!matchedTodo) {
    return res.status(404).send();
  }

  if (body.hasOwnProperty("completed") && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty("completed")) {
    return res.status(400).json({ error: "completed not boolean" });
  }

  if (
    body.hasOwnProperty("description") &&
    _.isString(body.description) &&
    body.description.trim().length > 0
  ) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty("description")) {
    return res.status(400).json({ error: "description not string" });
  }

  _.extend(matchedTodo, validAttributes);

  res.json(todos);
});

db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log("Express running todo API");
  });
});
