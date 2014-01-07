var request = require('request');

var username = process.env.username;
var password = process.env.password;

var authObj = {
      'user': username,
      'pass': password
    };

request = request.defaults({auth: authObj, json: true, headers: {'User-Agent':'request'}});

module.exports = request;