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

var User = sequelize.define("user", {
  email: Sequelize.STRING,
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync().then(() => {
  console.log("Everything is synched");

  // User.create({
  //   email: 'test@gmail.com'
  // }).then(() => {
  //   return Todo.create({
  //     description: "clean",
  //   })
  // }).then((todo) => {
  //   User.findById(1).then((user) => {
  //     user.addTodo(todo);
  //   });
  // });

  User.findById(1).then((user) => {
    user
      .getTodos({
        where: {
          completed: true,
        },
      })
      .then((todos) => {
        todos.forEach((todo) => {
          console.log(todo.toJSON());
        });
      });
  });
});
