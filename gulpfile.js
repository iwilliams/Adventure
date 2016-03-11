var gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify   = require("babelify"),
    concat     = require('gulp-concat'),
    buffer     = require('vinyl-buffer'),
    uglify     = require('gulp-uglify'),
    webserver = require('gulp-webserver'),
    source     = require('vinyl-source-stream');

var defaultTasks = [];
var buildTasks = [];

var bowerDir = function(dir) {
    return './bower_components/' + dir;
};

var includes = {
    three: './node_modules/three/'
};

// Run webserver
gulp.task('webserver', function() {
  gulp.src('./dist')
    .pipe(webserver({
      livereload: true,
      fallback: 'index.html',
      port: 3000
    }));
});
defaultTasks.push('webserver');

// Compile es6 code
// http://stackoverflow.com/questions/24992980/how-to-uglify-output-with-browserify-in-gulp
gulp.task('es6', function() {
    browserify("./src/client/index.js", { debug: true })
      .transform(babelify)
      .bundle()
      .on("error", function (err) { console.log("Error : " + err.message); })
      .pipe(source('index.js'))
      //.pipe(buffer())
      //.pipe(uglify())
      .pipe(gulp.dest('./dist/client'));
});
defaultTasks.push('es6');
buildTasks.push('es6');

// Compile es6 code
// http://stackoverflow.com/questions/24992980/how-to-uglify-output-with-browserify-in-gulp
gulp.task('simulation-worker', function() {
    browserify("./src/server/index.js", { debug: true })
      .transform(babelify)
      .bundle()
      .on("error", function (err) { console.log("Error : " + err.message); })
      .pipe(source('index.js'))
      //.pipe(buffer())
      //.pipe(uglify())
      .pipe(gulp.dest('./dist/server'));
});
defaultTasks.push('simulation-worker');
buildTasks.push('simulation-worker');

// Vendor Scripts
gulp.task('vendor-scripts', function() {
    return gulp.src([
        //includes.pixi  + 'pixi.min.js',
        //includes.three  + 'examples/js/controls/TrackballControls.js',
    ])
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});
defaultTasks.push('vendor-scripts');
buildTasks.push('vendor-scripts');

// Watches script directories and rebuilds on change
gulp.task('watch-scripts', function() {
    gulp.watch([
        './src/**/*.js',
    ], function() {
        console.log("~~~ Rebuilding Scripts... ~~~");
    });

    gulp.watch([
        './src/**/*.js',
    ], ['es6', 'simulation-worker']);
});
defaultTasks.push('watch-scripts');

gulp.task('move-resources', function() {
    gulp.src('./src/assets/**/*')
        .pipe(gulp.dest('./dist/assets'));
});
defaultTasks.push('move-resources');
buildTasks.push('move-resources');

gulp.task('watch-resources', function() {
    gulp.watch(['./src/assets/**/*'], ['move-resources']);
});
defaultTasks.push('watch-resources');

gulp.task('move-html', function() {
    gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./dist'));
});
defaultTasks.push('move-html');
buildTasks.push('move-html');

gulp.task('watch-html', function() {
    gulp.watch(['./src/**/*.html'], ['move-html']);
});
defaultTasks.push('watch-html');

gulp.task('default', defaultTasks);
gulp.task('build', buildTasks);
