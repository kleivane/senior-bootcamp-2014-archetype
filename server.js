
var express = require('express');
var request = require('./request-config');
var async = require('async');
var _ = require('underscore');
var app = express();

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var baseurl= process.env.baseurl;
var empbaseurl= process.env.empbaseurl;

var lookup = [];

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
  res.json("Hello");
});

app.get('/messages', function(req, res) {
  request.get({url: baseurl + "api/messages"},
    function(error, response, body) {
      console.log("Callback for messages called")
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

  var messageUrl = baseurl + "api/messages/"+req.params.id;

  request.get({url: messageUrl},
    function(error, response, body) {
      console.log("Callback for single message called");
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

function addUserDetailsAnyway(message) {
    message.user.senioritet = "Manager";
    message.user.avdeling = "Tech";
}

function enrichMessage(message, callback){

  // Get likes
  request.get(
    { url: baseurl + "/api/messages/" + message.id + "/likes"},
    function(error, reponse, body) {
       console.log("callback for likes lookup done");
       message.likes = body || [];

      var user = _.find(lookup, function(employee){
        return employee.Name == stripName(message.user.name)
      });

      if (!user) {
        console.log("No user found for name " + message.user.name);
        addUserDetailsAnyway(message);
        callback(null, message);
        return;
      }

      var requestUrl = empbaseurl + "employee/" + user.Id;
      console.log("Getting emp info via " + requestUrl);

      // Get employee dept. and seniority
      request.get(
        { url: requestUrl },
        function(error, response, body) {
          console.log("callback for emp lookup done");
          if(error) {
            console.log("an error has occured. keep calm and carry on.");
          }
          if (body != null && body[0] && body[0].Seniority && body[0].Department){
            message.user.senioritet = body[0].Seniority;
            message.user.avdeling = body[0].Department;  
          }
          else {
            addUserDetailsAnyway(message);
          }
          console.log("Returning enriched message")
          callback(null, message);
    });
  });
}

app.listen(port);

