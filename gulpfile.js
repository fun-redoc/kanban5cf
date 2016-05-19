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
               .pipe(pegjs({"allowedStartRules":["Start", "QueryExpression","SortExpression"]}))
               //.pipe(pegjs())
               .pipe(concat.header("module.exports = "))
               .pipe(gulp.dest('app'));
});

gulp.task("watchForPegJs", function() {
  gulp.watch("app/**/*.pegjs", {interval:1000}, ["compilePegjs"]);
});

gulp.task("watchForJs", function() {
  gulp.watch(['!node_modules/**/*.js', '**/*.js'], {interval:500}, ['test']);
});

// the default task
gulp.task("default", ["test","watchForPegJs", 'watchForJs']);
