// app.js
//
// setup
// var config = require("./config/env");
// var port = config.server.port;// process.env.PORT || 8080;
// var https = require('https');
// var http = require('https');
// var fs = require('fs');
var express = require("express");
// var mongoose = require("mongoose");
// var passport = require("passport");
var flash = require("connect-flash");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
// var httpsKey = fs.readFileSync('./keys/fun.redoc.test.key.pem');
// var httpsCert = fs.readFileSync('./keys/fun.redoc.test.cert.pem');
//var mongoClient = require("mongodb").MongoClient;
// var assert = require("assert");
// var Promise = require("promise");


module.exports = function(passport) {
  var app = express();

  // setup pipeline
  app.use(morgan("dev"));  // log every request to the console
  app.use(cookieParser()); // read cookies
  app.use(bodyParser());   // get information from body (html forms encoded)

  app.set("view engine", "ejs"); // ejs for templating

  // required for passwport
  app.use(session({secret:"thesessionsecretTODOgenerateRandomly" })); // secret session
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());  // use connect-flash for flash messages stored in session

  return app;
};
