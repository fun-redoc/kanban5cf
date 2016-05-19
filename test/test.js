var mongoose = require("mongoose");
var request = require('supertest');
var should = require('should'); 
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var winston = require('winston');
var chai = require("chai");
var Promise = require("promise");
var expect = chai.expect;

var config = require("../config/env");
var queryParams = require("../app/queryParams.js");

var Todo = require("../app/models/todo");

//require = require("really-need");

var port = 9999; //config.server.port;
var app;
var db;


before(function(done) {
  var passport = require("passport");
  app = require("../app")(passport);
  require("../config/passport")(passport);
  require("../app/routes.js")(app, passport, db);
  done();
});
after(function(done) {
  // close app
  // clear db
  // close db
  done();
});

describe("API test", function() {
  var server;
  var testObj = [
      { Name:"Test",
        DueDate: new Date(1967, 11, 15, 12, 11, 19),
        EntryDate: new Date(2004, 06, 19, 12, 11, 19),
        Status:"New",
        Priority:0.001,
        IsAssigned: false,
        Assignee:null},
      { Name:"Test",
        DueDate: new Date(1967, 11, 15, 12, 11, 19),
        EntryDate: new Date(2004, 06, 19, 12, 11, 19),
        Status:"New",
        Priority:0.002,
        IsAssigned: false,
        Assignee:null}
  ];

  var cnt = 1;

  beforeEach( function(done) {
    db = require("../db")(config.todoDB.uri);
    db.once("open", function() {
      var promisses = testObj.map(function(obj) {
                                    return new Promise(function(resolve, reject) {
                                      new Todo(obj)
                                        .save(function(err) {
                                          if(err) {
                                            return reject(err);
                                          }
                                          resolve();
                                        });
                                    });
      });
      Promise.all(promisses)
        .then(function() {
          server = app.listen(port, done);
        })
        .catch(function(err) {
          done(err);
        });
    });
  });
  afterEach( function(done) {
    var errForDone;
    var fnSetErr = function(err) { errForDone = err; };
    server.close(fnSetErr);
    Todo.remove(fnSetErr);
    mongoose.disconnect(fnSetErr);
    cnt++;
    done(errForDone);
  });

  it("API: soulb be able to post Todo item", function(done) {
    request(server)
      .post("/api/test/Tasks")
      .set("Content-Type", "application/json")
      .send(testObj[0])
      .expect(201)
      .end(function(err, res) {
        if(err) return done(err);
        done();
      });
  });

  it("API: should return number of entries", function(done) {
      request(server)
        .get("/api/test/Tasks/$count")
        .expect("Content-Type", "text/plain;charset=utf-8")
        .expect(200, JSON.stringify(testObj.length), done);
  });


  it("API: should return element with filter", function(done) {
      request(server)
        .get("/api/test/Tasks?$filter=Status%20eq%20%27New%27%20and%20IsAssigned%20eq%20false")
        .expect("Content-Type", "application/json")
        .expect(200)
        .expect(function(res) {
          var expectedLen = testObj.length;
          var gotObj = res.body.d.results;
          if( gotObj.length !== expectedLen) {
            return (new Error("Wrong number of elements received. \nExpected\n".concat(JSON.stringify(expectedLen)).concat("\nBut got\n").concat(JSON.stringify(gotObj.length)))); 
          }})
        .expect(function(res) {
          var gotObj = res.body.d.results;
          var ok = gotObj.reduce(function(pv, cv) {
            return pv && (
                gotObj.Name === testObj.Name &&
                gotObj.DueDate === testObj.DueDate &&
                gotObj.EntryDate === testObj.EntryDate &&
                gotObj.Status === testObj.Status &&
                gotObj.IsAssigned === testObj.IsAssigned &&
                gotObj.Assignee === testObj.Assignee
              );}, true);
          if( !ok) return (new Error("body does not match. \nExpected\n".concat(JSON.stringify(testObj)).concat("\nBut got\n").concat(JSON.stringify(gotObj))));
        })
        .end(done);
  });

  it("API: should return element with filter and other commands", function(done) {
      request(server)
        .get("/api/test/Tasks?$skip=0&$top=100&$orderby=Priority%20asc&$filter=Status%20eq%20%27New%27%20and%20IsAssigned%20eq%20false")
        .expect("Content-Type", "application/json")
        .expect(200)
        .expect(function(res) {
          var expectedLen = testObj.length;
          var gotObj = res.body.d.results;
          if( gotObj .length !== expectedLen) {
            return (new Error("Wrong number of elements received. \nExpected\n".concat(JSON.stringify(expectedLen)).concat("\nBut got\n").concat(JSON.stringify(gotObj.length)))); 
          }})
        .expect(function(res) {
          var gotObj = res.body.d.results;
          var ok = gotObj.reduce(function(pv, cv) {
            return pv && (
                gotObj.Name === testObj.Name &&
                gotObj.DueDate === testObj.DueDate &&
                gotObj.EntryDate === testObj.EntryDate &&
                gotObj.Status === testObj.Status &&
                gotObj.IsAssigned === testObj.IsAssigned &&
                gotObj.Assignee === testObj.Assignee
              );}, true);
          if( !ok) return (new Error("body does not match. \nExpected\n".concat(JSON.stringify(testObj)).concat("\nBut got\n").concat(JSON.stringify(gotObj))));
        })
        .end(done);
  });
});

describe("PEGJS expressions", function() {

  it("Priority desc", function() {
    expect(queryParams.parse("Priority desc", {startRule: "SortExpression"}))
      .to.deep.equal({'Priority':-1});
  });

  it("Priority asc", function() {
    expect(queryParams.parse("Priority asc", {startRule: "SortExpression"}))
      .to.deep.equal({'Priority':1});
  });
  
  it("Status eq \'Completed\'", function() {
    expect(queryParams.parse("Status eq \'Completed\'", {startRule: "QueryExpression"}))
      .to.deep.equal({'Status':'Completed'});
  });

  it("Status eq \'New\' and IsAssigned eq false", function() {
    expect(queryParams.parse("Status eq \'New\' and IsAssigned eq false",{startRule: "QueryExpression"}))
      .to.deep.equal({'Status':'New', 'IsAssigned':false});
  });

});
