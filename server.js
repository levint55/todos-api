var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Todo API Root");
});

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.get("/todos/:id", (req, res) => {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo;

  todos.forEach(element => {
    if (element.id === todoId){
      matchedTodo = element;
    }
  });

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

app.post("/todos", (req, res) => {
  var body = req.body;

  todos.push({
    id: todoNextId,
    description: body.description,
    completed: body.completed,
  });

  todoNextId++;

  res.json(body);
});

app.listen(port, () => {
  console.log("Express running todo API");
});
