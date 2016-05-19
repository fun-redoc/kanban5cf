// db.js
//
var mongoose = require("mongoose");
//var Promise = require("promise");

module.exports = function(uri) {
  // connect db
  mongoose.connect(uri);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  return db;
};
