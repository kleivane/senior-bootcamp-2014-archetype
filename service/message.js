var _ = require('underscore');

var store = [];

var save = function(message){
	console.log("save");
	store.push(message);
};

var fetch = function(id){
	console.log("fetch");
	return _.find(store, function(msg){
		return id = msg.id;
	})
};

module.exports = {save: save, fetch: fetch}