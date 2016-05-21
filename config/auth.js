// config/auth.js
//

var env = require("./env.js");

module.exports = {
  // https://console.developers.google.com/apis/credentials?project=fr-project-1268
  'googleAuth' : {
    'clientID': '52819547593-q8vq0utlrev0tk1g09c0ss6el2kd6nle.apps.googleusercontent.com',
    'clientSecret': 'KI6Vb72qHJCrIMzcrChE0OYN',
    'callbackURL': (env.server.ssl ? 'https://' : 'http://') + env.server.host + ':' + env.server.outerPort + '/auth/google/callback'
  }
};
