
var express = require('express');
var request = require('./request-config');

var async = require('async');
var _ = require('underscore');
var app = express();
app.use(express.bodyParser())

var employeeService = require('./service/employee');
var messageService = require('./service/message');

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var baseurl= process.env.baseurl;
var empbaseurl= process.env.empbaseurl;

employeeService.initialize();

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
          console.log("Multiple("+results.length+") messages enriched.")
          res.json(results);
        });
    });
});

app.post('/push', function(req, res){
  console.log("Her skal vi ta imot en post");
  console.log(req.body);
  messageService.save(JSON.parse(req.body.data));

  res.send(200);
  
})

app.get('/message/:id', function(req, res) {
  var id = req.params.id;

  var msg = messageService.fetch(id);

  if(msg){
    console.log("Found message(id:"+id+") in store. Returning.")
    res.json(msg);
    return;
  }

  var messageUrl = baseurl + "api/messages/"+ id;

  request.get({url: messageUrl},
    function(error, response, body) {
      console.log("Callback for single message called");
      if(error) {
        console.log("an error has occured. keep calm and carry on.");
      }
      var responseObj = body;

      async.map([body], enrichMessageWithLikes, function(err, results) {
          console.log("Single message enriched.")
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
    message.user.avdeling = "Technology";
}

function enrichMessage(message, callback){
    var user = _.find(employeeService.cache(), function(employee){
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
          callback(null, message);
    });
      
}
 function enrichMessageWithLikes(message, callback){
    // Get likes
  request.get(
    { url: baseurl + "/api/messages/" + message.id + "/likes"},
    function(error, reponse, body) {
       console.log("callback for likes lookup done");
       message.likes = body || [];

       enrichMessage(message, callback)
     });


 }
app.listen(port);

