// config/passport.js

var LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var UserModel = require("../app/models/user");
var configAuth = require("./auth");


module.exports = function(passport) {

  // ===
  // passport session setup
  // ===
  // required for persistent login sessions
  // passport needs to serialize and deserialize users out of sessions

  // user serializer
  passport.serializeUser(function(user,done) {
    done(null, user.id);
  });

  // user deserializer
  passport.deserializeUser(function(id, done) {
    UserModel.findById(id, function(err, user) {
      done(err, user);
    });
  });


  // ===
  // LOCAL signup
  // ===
  // use named strategies for login and for signup respectovelly

  // local signup strategy
  passport.use("local-signup", new LocalStrategy({
      // the default for local strategy is username/password
      // i want email/passwort
      usernameField: "email",
      passwordField: "password",
      passReqToCallback : true // enables passing back the entire request to the callback
    },
    function(req, email, password, done) {
      // do it assyncronously
      // User.findOne will not fire until data is sent back
      process.nextTick( function() {
        // find user whose email is the same as in the form
        // thus make sure user trying to login already exists
        UserModel.findOne({'local.email':email}, function(err, user) {
          // in case of errors finish with passing back the error
          if(err) {
            return done(err);
          }

          // check if there is a user with the email from the form input
          if(user) {
            return done(null, false, req.flash('signupMessage', 'This email adresss is already taken.'));
          } else {
            // if there is no user with that email
            // create a new one
            var newUser = new UserModel();
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

            // save the new user
            newUser.save(function(err) {
              if(err) throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }));


  // ===
  // LOCAL login
  // ===
  // named strategy for login
  passport.use("local-login", new LocalStrategy({
      // use email insted of username
      usernameField : "email",
      passwordField : "password",
      passReqToCallback : true // pass the whol request back to callback
    },
    function(req, email, password, done) {
      // find User by password (which should be unique)
      UserModel.findOne({'local.email':email}, function(err, user) {
        if(err) return done(err);
        if(!user) return done(null, false, req.flash('loginMessage', 'No user found.'));
        if(!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Wrong password.'));

        // all checks passed, return the user
        return done(null, user);
      });
    })
  );

  // ===
  // GOGLE Login
  // ===
  passport.use(new GoogleStrategy({
    clientID     : configAuth.googleAuth.clientID,
    clientSecret : configAuth.googleAuth.clientSecret,
    callbackURL  : configAuth.googleAuth.callbackURL
  },
  function(token, refreshToken, profile, done) {
    // asyncronously
    process.nextTick(function() {
      UserModel.findOne({'google.id': profile.id }, function(err, user) {
        if(err) return done(err);
        if(user) return done(null, user); // user already in the masterdata
        if(!user) {
          // user is not in the masterdata
          var newUser = new UserModel();
          newUser.google.id = profile.id;
          newUser.google.token = token;
          newUser.google.name = profile.displayName;
          newUser.google.email = profile.emails[0].value; // take the first on

          // save the user
          newUser.save(function(err) {
            if(err) throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));




};
