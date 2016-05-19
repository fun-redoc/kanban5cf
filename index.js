// server.js
//
// setup
var config = require("./config/env");
var port = config.server.port;// process.env.PORT || 8080;
var https = require('https');
var http = require('https');
var fs = require('fs');
var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var httpsKey = fs.readFileSync('./keys/fun.redoc.test.key.pem');
var httpsCert = fs.readFileSync('./keys/fun.redoc.test.cert.pem');
//var mongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var Promise = require("promise");

var app = require("./app")(passport);
var db = require("./db")(config.todoDB.uri);


// passport
require("./config/passport")(passport);

// routes
require("./app/routes.js")(app, passport, db); // load routes

db.once('open', function() {
  console.log("DB opened");

  // launch app
  //var options = {
  //  key:httpsKey,
  //  cert:httpsCert
  //};
  //var httpsServer = https.createServer(options, app);
  //httpsServer.listen(port);
  app.listen(port);
  console.log("server started on port", port);
 
});

