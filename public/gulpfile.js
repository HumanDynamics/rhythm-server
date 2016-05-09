const gulp = require('gulp')
const less = require('gulp-less')
const changed = require('gulp-changed')
const gulpBowerFiles = require('gulp-bower-files')
const path = require('path')
const fileinclude = require('gulp-file-include')
const rename = require('gulp-rename')
const notify = require('gulp-notify')

// compile into `www` directory
var dest = './www'

var paths = {
  templates: './src/templates/',
  less: 'src/styles/'
}

// Compiles LESS > CSS
gulp.task('build-less', function () {
  return gulp.src('src/styles/style.less')
             .pipe(less())
             .pipe(gulp.dest(dest + '/css'))
})

gulp.task('fileinclude', function () {
  return gulp.src(path.join(paths.templates, '*.template.html'))
             .pipe(fileinclude({
               prefix: '@@',
               basepath: '@root'
             }))
             .pipe(rename({
               extname: ''
             }))
             .pipe(rename({
               extname: '.html'
             }))
             .pipe(gulp.dest(dest))
             .pipe(notify({ message: 'Includes: included' }))
})

/*
   gulp.task('html', function () {
   return gulp.src('./src/index.html')
   .pipe(changed(dest))
   .pipe(gulp.dest(dest))
   }) */

gulp.task('assets', function () {
  return gulp.src('./src/assets/*')
             .pipe(changed(dest + '/assets'))
             .pipe(gulp.dest(dest + '/assets'))
})

gulp.task('bower-files', function () {
  gulpBowerFiles().pipe(gulp.dest(dest + '/lib'))
})

gulp.task('default', ['fileinclude', 'build-less', 'bower-files', 'assets'])
