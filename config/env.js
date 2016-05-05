var path = require('path');  
var config;

var env = process.env.NODE_ENV || 'local';  

var appEnv = {};  
var servicesEnv = {};  

if (env === 'production') {  
  var vcap_services = JSON.parse(process.env.VCAP_SERVICES); // Get Environment variables from your App ; more at https://docs.developer.swisscom.com/apps/deploy-apps/environment-variable.html
  var vcap_application = JSON.parse(process.env.VCAP_APPLICATION); // Get Environment variables from your App ; more at https://docs.developer.swisscom.com/apps/deploy-apps/environment-variable.html
  var uri = vcap_services.mongolab[0].credentials.uri; // Get the URI with the credekkkkk
  var appHost = vcap_application.application_uris[0];
  // Cloud Foundry
  config = {
    production: {
      todoDB : {
        uri: uri
      },
      server: {
        host: appHost,
        port: process.env.PORT || 8080,
        outerPort: 80 // outer port needed for cloud foundy, to be able to callback google auth
      },
      paths: {
        contentPath: path.join(__dirname, '/mime/')
      }
    }
  };
} else {

  config = {  
      local: {
        todoDB : {
          uri: 'mongodb://localhost:27017/todoDB',
        },
        server: {
          host: '127.0.0.1',
          port:  process.env.PORT || 8080,
          outerPort: 8080
        },
        paths: {
          contentPath: path.join(__dirname, '/mime/')
        }
      }
  };
}

module.exports = config[env];
