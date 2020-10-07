var Sequelize = require("sequelize");
var sequelize = new Sequelize(undefined, undefined, undefined, {
  dialect: "sqlite",
  storage: `${__dirname}/basic-sqlite-database.sqlite`,
});

var Todo = sequelize.define("todo", {
  description: {
    type: Sequelize.STRING,
  },
  completed: {
    type: Sequelize.BOOLEAN,
  },
});

sequelize.sync().then(() => {
  console.log("Everything is synched");

  Todo.create({
    description: "Walk",
    completed: true,
  }).then((todo) => {
    console.log("Create todo");
    console.log(todo);
  });
});
