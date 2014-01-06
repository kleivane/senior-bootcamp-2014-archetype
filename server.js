
var express = require('express');
var request = require('request');
var app = express();

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var username = process.env.username;
var password = process.env.password;
var baseurl= process.env.baseurl;

app.get('/', function(req, res) {
  console.log("Just logging (root)");
  res.json("Hello");
});

app.get('/messages', function(req, res) {
  console.log("Just logging (messages)");
  request.get({
    auth: {
      'user': username,
      'pass': password
    },
    url: baseurl + "api/messages",
    json: true,
    headers: {
            'User-Agent': 'request'
                }
    }, function(error, response, body) {
      console.log("Callback for ")
      if(error) {
        console.log("an error has occured. keep calm and carry on.");
      }
      res.json(body);
    });
});

app.get('/message/:id', function(req, res) {
  console.log("Just logging (message:id" +req.params.id+")");
  var url = baseurl + "api/messages/"+req.params.id;
  console.log("url: "+ url);
  request.get({
    auth: {
      'user': username,
      'pass': password
    },
    url: url,
    json: true,
    headers: {
            'User-Agent': 'request'
                }
    }, function(error, response, body) {
      console.log("Callback");
      console.log(body);
      if(error) {
        console.log("an error has occured. keep calm and carry on.");
      }
      res.json(body);
    });
  
});


app.listen(port);