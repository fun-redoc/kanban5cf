var mongoose = require("mongoose");
var Schema   = mongoose.Schema;

var todoSchema = new Schema( {
  ownerUserId: Schema.Types.ObjectId,
  Name : String,
  DueDate : Date,
  EntryDate : Date,
  Description : String,
  Status      : String,
  Priority    : Number,
  IsAssigned  : Boolean,
  Assignee    : String
});

module.exports = mongoose.model('Todo', todoSchema);
