//потключения модулей
const gulp = require('gulp')
const less = require('gulp-less')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const cleanCss = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const newer = require('gulp-newer')
const browsersync = require('browser-sync').create()
const del = require('del')

//пути к файлам и файлам назначения
const paths = {
   html: {
      src: "src/*.html",
      dest: "dist"
   },
   styles: {
      src: ["src/styles/**/*.sass", "src/styles/**/*.scss", "src/styles/**/*.less"],
      dest: "dist/css/"
   },
   scripts: {
      src: "src/scripts/**/*.js",
      dest: "dist/js/"
   },
   images: {
      src: "src/img/**",
      dest: "dist/img"
   }
}

//очистка каталога
function clean() {
   return del(["dist/*", "!dist/img"])
}

//минификация html
function html() {
   return gulp.src(paths.html.src)
   .pipe(htmlmin({ collapseWhitespace: true }))
   .pipe(size({
      showFiles: true
   }))
   .pipe(gulp.dest(paths.html.dest))
   .pipe(browsersync.stream())
}

//задача для обработки стилей
function styles() {
   return gulp.src(paths.styles.src)
   .pipe(sourcemaps.init())
   // .pipe(less())
   .pipe(sass().on('error', sass.logError))
   .pipe(autoprefixer({
      cascade: false
   }))
   .pipe(cleanCss({
      level: 2
   }))
   .pipe(rename({
      basename: "main",
      suffix: ".min"
   }))
   .pipe(sourcemaps.write('.'))
   .pipe(size({
      showFiles: true
   }))
   .pipe(gulp.dest(paths.styles.dest))
   .pipe(browsersync.stream())
}

//задача для обработки скриптов
function scripts() {
   return gulp.src(paths.scripts.src)
   .pipe(sourcemaps.init())
   .pipe(babel({
      presets: ['@babel/env']
   }))
   .pipe(uglify())
   .pipe(concat("main.min.js"))
   .pipe(sourcemaps.write('.'))
   .pipe(size({
      showFiles: true 
   }))
   .pipe(gulp.dest(paths.scripts.dest))
   .pipe(browsersync.stream())
}

//сжатие изоброжений
function img() {
   return gulp.src(paths.images.src)
   .pipe(newer(paths.images.dest))
   .pipe(imagemin({
      progressive: true 
   }))
   .pipe(size({
      showFiles: true
   }))
   .pipe(gulp.dest(paths.images.dest))
}

//отслеживание
function watch() {
   browsersync.init({
      server: {
         baseDir: "./dist/" 
      }
   })
   gulp.watch(paths.html.dest).on('change', browsersync.reload)
   gulp.watch(paths.html.src, html)
   gulp.watch(paths.styles.src, styles)
   gulp.watch(paths.scripts.src, scripts)
   gulp.watch(paths.images.src, img)
}

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, img) ,watch)

exports.clean = clean
exports.img = img
exports.html = html 
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build
exports.default = build