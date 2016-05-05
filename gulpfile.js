var gulp  = require("gulp");
var gutil = require("gulp-util");
var mocha = require("gulp-mocha");
var pegjs = require("gulp-pegjs");
var concat = require('gulp-concat-util');
//var fs    = require("fs");

// test
gulp.task("test", function() {
  return gulp.src("test/**/*.js", {read:false})
              .pipe(mocha({reporter:"nyan"}));
});

gulp.task('compilePegjs', function() {
    return gulp.src('app/*.pegjs')
               .pipe(pegjs())
               .pipe(concat.header("module.exports = "))
               .pipe(gulp.dest('src'));
});

gulp.task("watchForPegJs", function() {
  gulp.watch("**/*.pegjs", ["compilePegjs"]);
});

// watch
gulp.task("watchForTest", function() {
  gulp.watch('**/*.js', ['test']);
});

// the default task
gulp.task("default", ["watchForPegJs", 'watchForTest']);
