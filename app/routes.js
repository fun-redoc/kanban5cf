// app/routs.js
// handle 
// / - homepage with login link
// /loging - login
// /signup - signup
//
var express  = require("express");
var jsonMaper = require("json-mapper");
var config   = require("../config/env");
var queryParams    = require("./queryParams");
//var mongoose = require("mongoose");
var Todo = require("./models/todo.js");

module.exports = function(app, passport, db) {
  "use strict";

  var taskConverter = jsonMaper.makeConverter({
    __metadata : {
                  uri: function(input) {
                        if(input._id) {
                          return "http://localhost:8080/api/test/Tasks(".concat(input._id).concat(")");
                        }
                       },
                  type : function(intput) {
                           return "S1.Task";
                         }
                },
      _id : '_id',
      ID : '_id',
      Name: 'Name',
      EntryDate: function(input) {
        if(!input.EntryDate) {
          return;
        } else {
          return "/Date(".concat(JSON.stringify(input.EntryDate.getTime())).concat(")/");
        }
      },
      DueDate: function(input) {
        if(!input.DueDate){
          return;
        } else {
          return "/Date(".concat(JSON.stringify(input.DueDate.getTime())).concat(")/");
        }
      },
      Description: 'Description',
      IsAssigned:'IsAssigned',
      Assignee:'Assignee',
      Status:'Status',
      Priority: function(input) {
        if(input.Priority) {
          return input.Priority;
        }
      }
  });


  var odataConverter = jsonMaper.makeConverter( {
    "d": {
         "results": function(input) {
                      if(input instanceof Array) {
                          return input.map(function(task) {
                            return taskConverter(task);
                          });
                      } else {
                        return taskConverter(input);
                      }
                  },
        "__count": function(input) {
          return JSON.stringify(input.length);
        }
       }
  });

  var odataTask2Task = jsonMaper.makeConverter({
    Name: 'Name',
    DueDate: function(input) { 
      if(!input.DueDate) { 
        return; 
      } else {
        // TODO parse the Date and trasfer to js date format
        return new Date();
      }
    },
    EntryDate: function(input) { 
      if(!input.EntryDate) { 
        return; 
      } else {
        // TODO parse the Date and trasfer to js date format
        return new Date();
      }
    },
    Description:'Description',
    Status: 'Status',
    Priority: function(input) {
      if(input.Priority) {
        return parseFloat(input.Priority);
      }
    },
    IsAssigned: 'IsAssigned',
    Assignee: 'Assignee'
  });

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

  // Tasks

  router.route(/\/api\/test\/Tasks\((.+)\)/)
    .post(function(req,res) {
      var id = req.params[0];

      if(!id) return res.status(500).end();

      var XHTTPMethod = req.get('X-HTTP-Method');
      if(!XHTTPMethod) return res.status(500).end();

      console.log("Post Task", id, XHTTPMethod);

      if(XHTTPMethod === 'MERGE') {
        Todo.findByIdAndUpdate(id, odataTask2Task(req.body), null, function(err, task) {
          if(err) return res.status(500).end();
          console.log("body", req.body);
          console.log("return", task);

          res
           .status(200)
           .set("Content-Type", "application/json")
           .set("DataServiceVersion", "2.0")
           .json(odataConverter(task));

        });
      } else {
        console.log("unknown method", XHTTPMethod);
        // unknown method
        return res.status(500).end();
      }

    })
    .delete(function(req,res) {
      var id = req.params[0];

      if(!id) return res.status(500).end();

      Todo.findByIdAndRemove(id, function(err, task) {
        if(err) return res.status(500).end();

        res
         .status(200)
         .set("Content-Type", "application/json")
         .set("DataServiceVersion", "2.0")
         .json(odataConverter(task));

      });
    })
    .get(function(req,res) {
      var id = req.params[0];

      if(!id) return res.status(500).end();

      Todo.findById(id, function(err, task) {
        if(err) return res.status(500).end();

        res
         .status(200)
         .set("Content-Type", "application/json")
         .set("DataServiceVersion", "2.0")
         .json(odataConverter(task));

      });
    });

  router.route("/api/test/Tasks/:cmd")
    .get( function(req,res) {
      if( req.params.cmd === "$count" )  {
        var query = null;
        if(req.query.$filter) {
          query = queryParams.parse(req.query.$filter);
        } else {
          query = {};
        }
        Todo.count(query, function(err, count) {
          if(err) return console.erro(err);
           res.status(200);
           res.set('Content-Type', 'text/plain;charset=utf-8');
           res.send(count.toString());
        });
      } else {
        res.status(500).send(config.params.cmd.concat(" not known."));
      }
    });

  router.route("/api/test/Tasks")
    .post( function(req, res) {
      var task = new Todo(odataTask2Task(req.body));
      task.save(
        function(err, data) {
          if(err) {
            res
              .status(500)
              .send(err); // TODO send less details in producetion
          } else {
            var odata = {"d" : { "results": data }};
            res
              .status(201)
              .set("Content-Type", "application/json")
              .set("DataServiceVersion", "2.0")
              .json(odata);
          }
      });
    })
    .get( function(req,res) {
      var query = null;
      if(req.query.$filter) {
        query = queryParams.parse(req.query.$filter);
      } else {
        query = {};
      }
      var q = Todo.find(query);
      if(req.query.$skip) {
        q.skip(parseInt(req.query.$skip));
      }
      if(req.query.$top) {
        q.limit(parseInt(req.query.$top));
      }
      if(req.query.$orderby) {
        q.sort(queryParams.parse(req.query.$orderby, {startRule: "SortExpression"}));
      }
      q.exec(function(err, tasks) {
        if(err) return console.erro(err);

        res
         .status(200)
         .set("Content-Type", "application/json")
         .set("DataServiceVersion", "2.0")
         .json(odataConverter(tasks));
      });
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

