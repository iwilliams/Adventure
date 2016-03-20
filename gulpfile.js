var gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify   = require("babelify"),
    concat     = require('gulp-concat'),
    buffer     = require('vinyl-buffer'),
    uglify     = require('gulp-uglify'),
    webserver = require('gulp-webserver'),
    source     = require('vinyl-source-stream');
    //source     = require('gulp-eslint');

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

// Helper function to transpile JS
// http://stackoverflow.com/questions/24992980/how-to-uglify-output-with-browserify-in-gulp
function transpileJS(entryPoint, outputName, outputPath) {
    return function() {
        return browserify(entryPoint, { debug: true })
          .transform(babelify)
          .bundle()
          .on("error", function (err) { console.log("Error : " + err.message); })
          .pipe(source(outputName))
          //.pipe(buffer())
          //.pipe(uglify())
          .pipe(gulp.dest(outputPath));
    }
}

// Compile client es6 code
gulp.task('client-code', transpileJS('./src/client/index.js', 'index.js', './dist/client'));
defaultTasks.push('client-code');
buildTasks.push('client-code');

// Compile worker es6 code
gulp.task('simulation-worker', transpileJS('./src/server/index.js', 'index.js', './dist/server'));
defaultTasks.push('simulation-worker');
buildTasks.push('simulation-worker');

// Vendor Scripts
gulp.task('vendor-scripts', function() {
    return gulp.src([
        //includes.three + 'three.min.js',
        //includes.three + 'examples/js/loaders/DDSLoader.js',
        //includes.three + 'examples/js/loaders/MTLLoader.js',
        //includes.three + 'examples/js/loaders/OBJLoader.js'
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
    ], ['client-code', 'simulation-worker']);
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
