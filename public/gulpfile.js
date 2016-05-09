const gulp = require('gulp')
const less = require('gulp-less')
const changed = require('gulp-changed')
const gulpBowerFiles = require('gulp-bower-files')

// compile into `www` directory
var dest = './www'

// Compiles LESS > CSS
gulp.task('build-less', function () {
  return gulp.src('src/styles/style.less')
             .pipe(less())
             .pipe(gulp.dest(dest + '/css'))
})

gulp.task('html', function () {
  return gulp.src('./src/index.html')
             .pipe(changed(dest))
             .pipe(gulp.dest(dest))
})

gulp.task('img', function () {
  return gulp.src('./src/assets/*')
             .pipe(changed(dest + '/assets'))
             .pipe(gulp.dest(dest + '/assets'))
})

gulp.task('bower-files', function () {
  gulpBowerFiles().pipe(gulp.dest(dest + '/lib'))
})

gulp.task('default', ['build-less', 'html', 'bower-files', 'img'])
