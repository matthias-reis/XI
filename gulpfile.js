var gulp = require('gulp'),
    nodemon = require('gulp-nodemon');
    sass = require('gulp-sass');
    rename = require('gulp-rename');

gulp.task('sass', function () {
    gulp.src('./view/*/sass/*.scss', {base: './'})
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('sass', 'css');
            console.log(path);
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('js', function () {
    gulp.src().pipe()
});

gulp.task('runprod', function () {
});

gulp.task('run', function () {
    nodemon({
        script: 'bin/dev.js',
        ext: 'js html',
        env: { 'NODE_ENV': 'development' }
    }).on('restart', function () {
        console.log('*******');
        console.log('RESTART');
        console.log('*******');
    });
});