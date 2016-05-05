var mongoose = require("mongoose");
var Schema   = mongoose.Schema;

var todoSchema = new Schema( {
  Name : String,
  DueData : Date,
  Description : String,
  Status      : String,
  Priority    : Number,
  IsAssigned  : Boolean,
  Assignee    : String
});

module.exports = mongoose.model('Todo', todoSchema);
