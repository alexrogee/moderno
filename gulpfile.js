const { src, dest, watch, series, parallel } = require('gulp');

const scss         = require('gulp-sass');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const del          = require('del');
const cssmin       = require('gulp-cssmin');

function browsersync() {
   browserSync.init({
      server : {
         baseDir: 'app/'
      },
      notify: false   
   })   
}

function cleanDist() {
   return del('dist')
}

function images(){
   return src('app/images/**/*')
      .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]
      ))
      .pipe(dest('dist/images'))
}

function scripts() {
   return src([
      'node_modules/jquerry/index.js',
      'node_modules/slick-carousel/slick/slick.js',
      'app/js/main.js'
   ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('app/js'))
      .pipe(browserSync.stream())
}

function sass() {
   return src('app/scss/**/*.scss')
         .pipe(scss({outputStyle: 'expanded'}))
         .pipe(concat('style.min.css'))
         .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
         }))
         .pipe(dest('app/css'))
         .pipe(browserSync.stream())
}

function styles() {
   return src([
      'node_modules/normalize.css/normalize.css',
      'node_modules/slick-carousel/slick/slick.css'
   ])
   .pipe(concat('libs.min.css'))
   .pipe(cssmin())
   .pipe(dest('app/css'))
};

function build () {
   return src([
      'app/css/style.min.css',
      'app/fonts/**/*',
      'app/js/main.min.js',
      'app/*.html',
      'app/images/**/*'
   ], {base: 'app'})
      .pipe(dest('dist'))
}

function watching() {
   watch(['app/scss/**/*.scss'], sass)
   watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
   watch(['app/*.html']).on('change', browserSync.reload);
}


exports.sass = sass;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.styles = styles;

exports.build = series(cleanDist, images, build);
exports.default = parallel(sass, styles, scripts, browsersync, watching);