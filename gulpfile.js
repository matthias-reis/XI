var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    sizereport = require('gulp-sizereport'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    Server = require('karma').Server;

gulp.task('sass', function() {
  gulp.src('./view/*/sass/*.scss', {base: './'})
      .pipe(sass().on('error', sass.logError))
      .pipe(rename(function(path) {
        path.dirname = path.dirname.replace('sass', 'css');
      }))
      .pipe(gulp.dest('.'));
});

gulp.task('lint', function() {
  gulp.src('./client/js/x1/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default', {verbose: true}));
});

gulp.task('uglify', ['lint'], function() {
  gulp.src('./client/js/x1/*.js', {base: './'})
      .pipe(uglify())
      .pipe(rename(function(path) {
        path.dirname = path.dirname.replace('/x1', '/x1-min');
        path.basename = path.basename + '.min';
      }))
      .pipe(gulp.dest('.'))
});

gulp.task('js', ['uglify'], function() {
  gulp.src('./client/js/x1-min/*.js')
      .pipe(sizereport())
});

gulp.task('test', function(done) {
  console.log('*** STARTING UNIT TESTS ***');
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function() {
    console.log('*** END UNIT TESTS ***');
    done();
  }).start();
});

gulp.task('server', function() {
  nodemon({
    script: 'bin/dev.js',
    ext: 'js html',
    env: {'NODE_ENV': 'development'}
  }).on('restart', function() {
    console.log('*******');
    console.log('RESTART');
    console.log('*******');
  });
});