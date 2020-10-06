var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var todos = [
  {
    id: 1,
    description: "Meet someone",
    completed: false,
  },
  {
    id: 2,
    description: "Go to market",
    completed: false,
  },
  {
    id: 3,
    description: "Eat",
    completed: true,
  },
];

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

app.listen(port, () => {
  console.log("Express running todo API");
});
