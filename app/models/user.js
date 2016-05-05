// app/models/user.js
//

// initializations
var mongoose = require("mongoose");
var bcrypt   = require("bcrypt");

var userSchema = mongoose.Schema({
  local : {
    email : String,
    password : String
  },
  facebook : {
    id : String,
    token : String,
    email : String,
    name  : String
  },
  twitter : {
    id : String,
    token : String,
    displayName : String,
    userName : String
  },
  google : {
    id : String,
    token : String,
    email : String,
    name : String
  }
});

// methods
//

// generation a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// check if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt. compareSync(password, this.local.password);
};

// create model for users and expose it to node
//
module.exports = mongoose.model('User', userSchema);
