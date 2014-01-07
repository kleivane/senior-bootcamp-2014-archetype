
var express = require('express');
var request = require('./util/request-config');

var async = require('async');
var _ = require('underscore');
var app = express();
app.use(express.bodyParser())

var employeeService = require('./service/employee');
var messageService = require('./service/message');

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var baseurl= process.env.baseurl;

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
      async.map(body, addEmployeeInfo, function(err, results) {
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

  messageService.fetch(id, function(result){
    if (result) {
      console.log("Found message (id:"+id+") in store. Returning.")
      res.json(result);
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

});

function addEmployeeInfo(message, callback){
    employeeService.fetchUserInfo(message.user.name, function(userinfo){
      message.user = _.extend(message.user, userinfo);
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

       addEmployeeInfo(message, callback)
     });


 }

app.listen(port);

