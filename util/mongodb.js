var mongodb = require('mongodb');

var mongoClient = mongodb.MongoClient
var collection;
var constring = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/test';

mongoClient.connect(constring, function(err, db) {
  if(err) throw err;
  collection = db.collection('socialcast');
});


var insert = function (key, document) {
  document._id = key;
  collection.insert(document, function(err, docs) {
    collection.count(function(err, count) {
      console.log("count = " + count);
    });
  });
}

var query = function (key, callback) {
  collection.findOne({id: key}, { _id: 0}, function(err, result) {
    console.log("query found = " + result);
    callback(result);
  });
}

module.exports = { insert: insert, query: query };

