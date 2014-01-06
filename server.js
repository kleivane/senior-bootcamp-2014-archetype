
var express = require('express');
var request = require('request');
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
      res.json(body);
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
      var user = body.user.name;

      // Getting employee name
      request.get({
        url: empbaseurl + "search?q=" + user.replace(" ", "%20")},
        function(error, response, body) {
          console.log("Callback for emp lookup");
          if(error) {
            console.log("an error has occured. keep calm and carry on.");
          }
          if(body != null && body.Seniority && body.Department){
            responseObj.user.senioritet = body.Seniority;
            responseObj.user.avdeling = body.Department;
          }
          res.json(responseObj);  
          

      });

    }); 
});


function stripName(fullName){
  var name = fullName.slice(0, fullName.indexOf(" "));
  return name + fullName.slice(fullName.lastIndexOf(" "));
}

app.listen(port);
