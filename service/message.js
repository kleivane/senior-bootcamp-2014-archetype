var _ = require('underscore');

var store = [];

var save = function(message){
	console.log("Saving message with id "+message.id);
	store.push(message);
};

var fetch = function(id){
	console.log("Looking for message(id:"+id+") in store");
	console.log(store)
	return _.find(store, function(msg){
		return id == msg.id;
	})
};

module.exports = {save: save, fetch: fetch}