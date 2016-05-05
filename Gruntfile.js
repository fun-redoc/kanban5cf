'use strict';

var LIVERELOAD_PORT   = 35720;
var SERVER_PORT       = 3000;

var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-nodemon');


  // Define the configuration for all the tasks
  grunt.initConfig({
    concurrent: {
      dev: {
        tasks: ['nodemon:dev',
                'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          nodeArgs: ['--debug'],
          env: {
            PORT: '5455'
          },
          // omit this property if you aren't serving HTML files and 
          // don't want to open a browser tab on start
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('open')('http://localhost:' + SERVER_PORT);
              }, 1000);
            });

            // refreshes browser when server reboots
            nodemon.on('restart', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('fs').writeFileSync('.rebooted', 'rebooted');
              }, 1000);
            });
          }
        }
      }
    },
    shell: {
        mongodb: {
            command: 'mongod --syslog --dbpath ~/mdata/db',
            options: {
                async: true,
                stdout: false,
                stderr: true,
                failOnError: true,
                execOptions: {
                    cwd: '.'
                }
            }
        }
    },
    watch: {
      //server : {
      //  files : ['.rebooted'],
      //  options : {
      //    livereload : true
      //  }
      //},
      options: {
        nospawn: true,
        livereload: true
      },
//      src : {
//        files: ['test/**', 'model/**'],
//        tasks: ['copy:model', 'copy:test']
//      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '.rebooted',
          '**/*.html',
          '**/*.xml',
          '**/*.css',
          '**/*.js',
          '.tmp/**/*.html',
          '.tmp/**/*.js',
          '.tmp/**/*.json',
          '.tmp/**/*.xml'
        ]
      }
    },
    connect: {
      options: {
        port: SERVER_PORT,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect){
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, '.' ),
              proxySnippet
            ];
          }
        }
      },
     //copy : {
     // test : {
     //   files : [{
     //     expand: true,
     //     cwd: 'test/',
     //     src : '**',
     //     dest : '.tmp'
     //   }]
     // },
     // resources : {
     //   files : [
     //     {
     //     expand: true,
     //     cwd: RESOURCES_FOLDER + '/',
     //     src: '**',
     //     dest: '.tmp/resources'
     //     }
     //   ]
     // }
    },
    open: {
      server: {
        path: 'http://localhost:' + SERVER_PORT
      }
    },
    clean:{
      options : {
        force : true
      },
      temp : '.tmp'
    }

  });

  grunt.registerTask('server', function(target) {

    switch (target){
      case 'local':
        grunt.task.run([
          'clean:temp',
          'shell:mongodb',
          'connect:livereload',
          'concurrent:dev'
        ]);
        break;
      default:
        grunt.task.run([
          'clean:temp',
          'connect:livereload',
          'open:server',
          'watch'
        ]);
        break;
    }
  });

  grunt.registerTask('default', [
    'server:local'
  ]);

};
