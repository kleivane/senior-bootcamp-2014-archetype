var _ = require('underscore');
var collection = require('../util/mongodb');

var store = [];

var save = function(message){
  console.log("Saving message with id "+message.id);
  store.push(message);
  collection.insert(message.id, message);
};

var fetch = function(id, callback){
  console.log("Looking for message(id:"+id+") in store");
  console.log(store)
//  return _.find(store, function(msg){
//          return id == msg.id;
//  })

  collection.query(parseInt(id), function(result){
    callback(result);
  });
};

module.exports = {save: save, fetch: fetch}
