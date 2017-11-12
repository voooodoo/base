var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    postcss      = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    browser = require('browser-sync').create(),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    pug = require('gulp-pug'),
    rename = require('gulp-rename'),
    inject = require('gulp-inject'),
    iconfont = require("gulp-iconfont"),
    consolidate = require("gulp-consolidate");

var svgWatch = './assets/src/*.svg';
var svgIconsSource = './assets/src/svg.html';
var svgIconsDestination = './';

gulp.task('sass', function () {
    return gulp.src('assets/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            output_style: 'compressed'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browser.stream({match: '**/*.css'}));
    });  

 // Starts a BrowerSync instance
gulp.task('serve', ['sass'], function(){
    browser.init({
          server: {
              baseDir: "./"
          }
      });
  });
  
  // Runs all of the above tasks and then waits for files to change
  gulp.task('default', ['serve'], function() {
    gulp.watch(['assets/scss/**/*.scss'], ['sass']);
    gulp.watch('./**/*.html').on('change', browser.reload);
  });

  gulp.task('svgstore', function () {

    var svgs = gulp
        .src(svgWatch)
        .pipe(rename({ prefix: 'svg-' }))
        .pipe(svgmin())
        .pipe(svgstore({ inlineSvg: true }));

    function fileContents(filePath, file) {
        return file.contents.toString();
    }
    return gulp
        .src(svgIconsSource)
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest(svgIconsDestination));
});
/*gulp.task('svgstore', function () {
    return gulp
        .src('assets/src/*.svg')
        .pipe(svgmin(function (file) {
             return {
                plugins: [{
                    cleanupIDs: {
                        prefix: 'svg',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('dist/svg'));
});
*/

gulp.task('views', function buildHTML() {
    return gulp.src('assets/views/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./'))
});

gulp.task("build:icons", function () {
    return gulp.src(["./assets/icons/*.svg"]) //path to svg icons
        .pipe(iconfont({
            fontName: "myicons",
            formats: ["ttf", "eot", "woff", "svg"],
            centerHorizontally: true,
            fixedWidth: true,
            normalize: true,
            height:500
        }))
        .on("glyphs", (glyphs) => {

            gulp.src("./assets/icons/util/*.scss") // Template for scss files
                .pipe(consolidate("lodash", {
                    glyphs: glyphs,
                    fontName: "myicons",
                    fontPath: "../fonts/"
                }))
                .pipe(gulp.dest("./assets/scss/icons/")); // generated scss files with classes
        })
        .pipe(gulp.dest("./dist/assets/fonts/")); //icon font destination
});