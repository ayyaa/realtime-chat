var express = require('express');
var router = express.Router();
var fs = require('fs');
var creds = '';
var redis = require('redis');
var client = '';
var path = require('path');

fs.readFile('creds.json', 'utf-8', function(err, data) {
  if(err) throw err;
  creds = JSON.parse(data);
  client = redis.createClient('redis://' + creds.user + ':' + creds.password + '@' + creds.host + ':' + creds.port);
  // Redis Client Ready
  client.once('ready', function() {
    // Flush Redis DB
    // client.flushdb();
    // Initialize Chatters
    client.get('chat_users', function(err, reply) {
      if (reply) {
        chatters = JSON.parse(reply);
      }
    });
    // Initialize Messages
    client.get('chat_app_messages', function(err, reply) {
      if (reply) {
        chat_messages = JSON.parse(reply);
      }
    });
  });
});
// Store people in chatroom
var chatters = [];
// Store messages in chatroom
var chat_messages = [];

router.get('/', function (req, res) {
  res.sendFile(path.resolve('/Users/tsurayya/Documents/real-time-chat/views/index.html'));
});

router.post('/join', function(req, res) {
  var username = req.body.username;
  console.log(username)
  if (chatters.indexOf(username) === -1) {
    chatters.push(username);
    client.set('chat_users', JSON.stringify(chatters));
    res.send({
      'chatters': chatters,
      'status': 'OK'
    });
  } else {
    res.send({
      'status': 'FAILED'
    });
  }
});

router.post('/leave', function(req, res) {
  var username = req.body.username;
  chatters.splice(chatters.indexOf(username), 1);
  client.set('chat_users', JSON.stringify(chatters));
  res.send({
    'status': 'OK'
  });
});

router.post('/send_message', function(req, res) {
  var username = req.body.username;
  var message = req.body.message;
  chat_messages.push({
    'sender': username,
    'message': message
  });
  client.set('chat_app_messages', JSON.stringify(chat_messages));
  res.send({
    'status': 'OK'
  });
});

router.get('/get_messages', function(req, res) {
  res.send(chat_messages);
});

router.get('/get_chatters', function(req, res) {
  res.send(chatters);
});

module.exports = router;
