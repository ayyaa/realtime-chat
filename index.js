
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var port = process.env.PORT || 8080;

var router = require('./routes/router');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/', router);

// Start the Server
http.listen(port, function() {
  console.log('Server Started. Listening on *:' + port);
});

io.on('connection', function(socket) {
  // Fire 'send' event for updating Message list in UI
  socket.on('message', function(data) {
      io.emit('send', data);
  });
  // Fire 'count_chatters' for updating Chatter Count in UI
  socket.on('update_chatter_count', function(data) {
      io.emit('count_chatters', data);
  });
});
