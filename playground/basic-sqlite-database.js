var Sequelize = require("sequelize");
var sequelize = new Sequelize(undefined, undefined, undefined, {
  dialect: "sqlite",
  storage: `${__dirname}/basic-sqlite-database.sqlite`,
});

var Todo = sequelize.define("todo", {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 250],
    },
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

sequelize.sync().then(() => {
  console.log("Everything is synched");

  Todo.findById(1)
    .then((todo) => {
      console.log(todo.toJSON());
    })
    .catch((e) => {
      console.log(e);
    });

  // Todo.create({
  //   description: "Test Lagi",
  // }).then(() => {
  //   return Todo.create({
  //     description: "Clean"
  //   });
  // }).then(() => {
  //   return Todo.findAll({
  //     where: {
  //       description: {
  //         $like: '%lean%'
  //       }
  //     }
  //   })
  // }).then((todos) => {
  //   if(todos){
  //     todos.forEach(todo => {
  //       console.log(todo.toJSON());
  //     });
  //   } else {
  //     console.log("No data found");
  //   }
  // }).catch((e) => {
  //   console.log(e);
  // });
});
