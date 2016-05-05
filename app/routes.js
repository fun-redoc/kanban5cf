// app/routs.js
// handle 
// / - homepage with login link
// /loging - login
// /signup - signup
//
var express  = require("express");
var config   = require("../config/env");
var query    = require("./queryParams");
//var mongoose = require("mongoose");
var Todo = require("./models/todo.js");

module.exports = function(app, passport, db) {
  "use strict";

  var router = express.Router();
  app.use("/",router);
  
  console.log(__dirname);

  // static ressources
  router.use("/webapp", isLoggedIn);
  router.use("/webapp", express.static(__dirname + "/../jquery", {
        dotfiles: "ignore",
        etag: true,
        extensions:false,
        falltrhrough:true,
        index:"index.html",
        lastModified:true,
        maxAge: 0, // 30*60000, // 30 minutes
        redirect:true
     })
  );

  router.use("/ui5", isLoggedIn);
  router.use("/ui5", express.static(__dirname + "/../ui5", {
        dotfiles: "ignore",
        etag: true,
        extensions:false,
        falltrhrough:true,
        index:"index.html",
        lastModified:true,
        maxAge: 0, // 30*60000, // 30 minutes
        redirect:true
     })
  );

  // / - homepage
  router.route("/")
    .get(function(req, res) {
      // render the index.ejs
      res.render('index.ejs', {
 
        config:config
      });
    });


  // /loging - login form
  router.route("/login")
    .get(function(req, res) {
      // render login form and pass flash data if exists
      res.render("login.ejs", { message: req.flash("loginMessage")});
    })
    .post( passport.authenticate('local-login', {
       successRedirect : "/profile",
       failureRedirect : "/login",
       failureFlash    : true // enable flash messages
    }));


  // /signup - signup form
  router.route('/signup')
    .get(function(req,res) {
      res.render("signup.ejs", { message: req.flash("signupMessage")});
    })
    .post( passport.authenticate('local-signup', {
      // process signup form
      // use the named local-signup strategy
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true // allow flash messages
    }));
  
  // /profile - profile selection
  // -- must be protected, so that user must to login first
  // -- route middleware will help to verify if the user is loged in
  // -- using the isLoggedIn funtion
  router.route("/profile")
    .get( isLoggedIn, function(req, res) {
      res.render("profile.ejs", { 
        user : req.user // get the user from session and pass to template
      });
    });


  // /logout - logout
  router.route("/logout")
    .get( function(req, res) {
      req.logout();
      res.redirect("/");
    });

  //
  router.route("/api/test/Tasks/:cmd")
    .get( function(req,res) {
      console.log("WITH COMMAND", req.query, req.params);
    });
  router.route("/api/test/Tasks")
    .get( function(req,res) {
      console.log("WITHOUT COMMAND", req.query);
    });

  // API Test with authentication
  router.route("/api/test/\\$metadata")
   //.get(isLoggedIn, function(req,res) {
   .get(function(req,res) {
      var options = {
        root: __dirname + "/../ui5/localService/",
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      };

      var fileName = "metadata.xml";
      res.sendfile(fileName, options, function (err) {
        if (err) {
          console.log(err);
          res.status(err.status).end();
        }
        else {
          console.log('Sent:', fileName);
        }
      });
  });

  // API Test with authentication
  router.route("/api/test")
   //.get(isLoggedIn, function(req,res) {
   .get(function(req,res) {
     //res.send("todo.ejs");
    // var todosCollection = db.collection("todos");
    // todosCollection.find({}).toArray(function(err, todos) {
    //   if(err) return console.error(err);
    //   res.json(todos);
    // });
     Todo.find({}).count().exec( function(err, todos) {
       if(err) return console.error(err);
         res.json(todos);
       });
   });


  // === 
  // GOOGLE Protokoll routes
  // http://passportjs.org/docs
  // ===-
  // send to google for authentication receive user profile and email
  router.route('/auth/google')
    .get(passport.authenticate('google', {scope: ['profile', 'email']}));

  // redirect callback after google has identified the user
  router.route('/auth/google/callback')
    .get( passport.authenticate('google', {
              successRedirect: '/profile',
              failureRedirect: '/',
              failureFlash: true })
    );

};

// rout middleware, mak sure user is logged in
function isLoggedIn(req, res, next) {
  if( req.isAuthenticated() ) {
    return next();
  }
  res.redirect("/");
}

