
var express = require('express');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var app = express();

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var username = process.env.username;
var password = process.env.password;
var baseurl= process.env.baseurl;
var empbaseurl= process.env.empbaseurl;

var lookup = [];

var authObj = {
      'user': username,
      'pass': password
    };

request = request.defaults({auth: authObj, json: true, headers: {'User-Agent':'request'}});

request.get({url: empbaseurl + "all"},
    function(error, response, body) {
      console.log("Initializing cache")
      lookup = _.map(body, function(employee){
        console.log(employee)
        return {Id: employee.Id, Name: stripName(employee.Name)};
      });
      console.log(lookup);
    });

app.get('/', function(req, res) {
  console.log("Just logging (root)");
  res.json("Hello");
});

app.get('/messages', function(req, res) {
  console.log("Just logging (messages)");
  request.get({url: baseurl + "api/messages"},
    function(error, response, body) {
      console.log("Callback for ")
      if(error) {
        console.log("an error has occured. keep calm and carry on.");
      }
      async.map(body, enrichMessage, function(err, results) {
          console.log("Async done")
          res.json(results);
        });
    });
});

app.get('/message/:id', function(req, res) {

  console.log("Just logging (message:id:" +req.params.id+")");
  var url = baseurl + "api/messages/"+req.params.id;

  console.log("url: "+ url);
  request.get({url: url},
    function(error, response, body) {
      console.log("Callback");
      if(error) {
        console.log("an error has occured. keep calm and carry on.");
      }
      var responseObj = body;

      async.map([body], enrichMessage, function(err, results) {
            console.log("Async done")
            console.log(results)
          res.json(results[0]);
        });

    }); 
});


function stripName(fullName){
  var name = fullName.slice(0, fullName.indexOf(" "));
  return name + fullName.slice(fullName.lastIndexOf(" "));
}

function enrichMessage(message, callback){

  // get likes
  request.get(
    { url: baseurl + "/api/messages/" + message.id + "/likes"},
    function(error, reponse, body) {
       console.log("callback for likes lookup done");
       console.log(body);
       message.likes = body || [];

      var user = _.find(lookup, function(employee){
        return employee.Name == stripName(message.user.name)
      });

      console.log("User: ");
      console.log(user);

      if (!user) {
        console.log("No user found for name " + message.user.name);
        callback(null, message);
        return;
      }

      var requestUrl = empbaseurl + "employee/" + user.Id;
      console.log("Getting emp info via " + requestUrl);

      // Getting employee name
      request.get(
        { url: requestUrl },
        function(error, response, body) {
          console.log("callback for emp lookup done");
          console.log(body);
          if(error) {
            console.log("an error has occured. keep calm and carry on.");
          }
          if(body != null && body[0]&& body[0].Seniority && body[0].Department){
            message.user.senioritet = body[0].Seniority;
            message.user.avdeling = body[0].Department;  
          }
          console.log("Returning enriched message")
          console.log(message.user)
          callback(null, message);
    });
  });
}
app.listen(port);
