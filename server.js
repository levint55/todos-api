var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Todo API Root');
});

app.listen(port, () => {
  console.log('Express running todo API');
});
