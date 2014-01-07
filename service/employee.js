var request = require('../util/request-config');
var _ = require('underscore');

var empbaseurl= process.env.empbaseurl;

var lookup = [];

var initialize = function(){
	request.get({url: empbaseurl + "all"},
    function(error, response, body) {
      console.log("Initializing cache")
      lookup = _.map(body, function(employee){
        console.log(employee);
        return {Id: employee.Id, Name: stripName(employee.Name)};
      });
      console.log(lookup);
      console.log("Initializing done");
    });
};

var fetchUserInfo = function(name, callback){
	var defaultUserinfo = {senioritet: "Manager", avdeling: "Technology"};
	var user = _.find(lookup, function(employee){
        return employee.Name == stripName(name)
      });

      if (!user) {
        console.log("No user found for name " + name);
        callback(defaultUserinfo);
        return;
      }

      var requestUrl = empbaseurl + "employee/" + user.Id;

      // Get employee dept. and seniority
      request.get(
        { url: requestUrl },
        function(error, response, body) {
          if(error) {
            console.log("an error has occured. keep calm and carry on.");
          }

          if (!body){
			callback(defaultUserinfo);
			return;
          }
          var employee = body[0];
          var userinfo = {};
          userinfo.senioritet = employee.Seniority || defaultUserinfo.senioritet;
          userinfo.avdeling = employee.Department || defaultUserinfo.avdeling;  
          callback(userinfo);
    });
};


function stripName(fullName){
  var name = fullName.slice(0, fullName.indexOf(" "));
  return name + fullName.slice(fullName.lastIndexOf(" "));
}

module.exports = { initialize: initialize, fetchUserInfo: fetchUserInfo};