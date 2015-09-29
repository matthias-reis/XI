var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    sizereport = require('gulp-sizereport'),
    rename = require('gulp-rename'),
    Server = require('karma').Server;

gulp.task('lint', function() {
  gulp.src('./src/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default', {verbose: true}));
});

gulp.task('uglify', ['lint'], function() {
  gulp.src('./src/*.js', {base: './'})
      .pipe(uglify())
      .pipe(rename(function(path) {
        path.dirname = path.dirname.replace('src', 'min');
        path.basename = path.basename + '.min';
      }))
      .pipe(gulp.dest('.'))
});

gulp.task('js', ['uglify'], function() {
  gulp.src('min/*.js')
      .pipe(sizereport({
        gzip: true
      }));
});

gulp.task('test', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function() {
    done();
  }).start();
});

gulp.task('default', ['js']);
