var request = require('../request-config');
var _ = require('underscore');

var empbaseurl= process.env.empbaseurl;

var lookup = [];

var cache = function(){
	return lookup;
};

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

function stripName(fullName){
  var name = fullName.slice(0, fullName.indexOf(" "));
  return name + fullName.slice(fullName.lastIndexOf(" "));
}

module.exports = { initialize: initialize, cache: cache};