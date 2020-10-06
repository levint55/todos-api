var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

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
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

app.post("/todos", (req, res) => {
  var body = _.pick(req.body, 'description', 'completed');

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }

  todos.push({
    id: todoNextId,
    description: body.description.trim(),
    completed: body.completed,
  });

  todoNextId++;

  res.json(body);
});

app.delete("/todos/:id", (req, res) => {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (!matchedTodo){
    res.status(404).json({"error": "no todo found with that id"});
  } else {
    todos = _.without(todos, matchedTodo);
  }

  res.json(todos);
});

app.listen(port, () => {
  console.log("Express running todo API");
});
