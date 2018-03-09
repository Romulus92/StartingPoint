const gulp = require('gulp');
const pug = require('gulp-pug');

const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const del = require('del');

const browserSync = require('browser-sync').create();

/* const gulpWebpack = require('webpack-stream');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js'); */

const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');

const spritesmith = require('gulp.spritesmith');
const svgSprite = require('gulp-svg-sprite');

const paths = {
    root: './docs',
    templates: {
        pages: 'src/templates/pages/*.pug',
        src: 'src/templates/**/*.pug'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'docs/assets/styles/'
    },
    images: {
        src: 'src/images/**/*.*',
        dest: 'docs/assets/images/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'docs/assets/scripts/'
    },
    fonts: {
        src: 'src/webfonts/**/*.*',
        dest: 'docs/assets/webfonts'
    },
    sprite: {
        src: 'src/sprites/**/*.png',
        dest: 'docs/assets/sprites'
    },
    svgsprite: {
        src: 'src/svg/*.svg',
        dest: 'docs/assets/svg'
    }
}

// pug
function templates() {
    return gulp.src(paths.templates.pages)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.root));
}

// перевод из scss в css + префиксы и минимизация
function styles() {
    return gulp.src('./src/styles/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: require('node-normalize-scss').includePaths
        }))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.styles.dest))
}

// очистка
function clean() {
    return del(paths.root);
}

// перенос JS
function scripts() {
    return gulp.src('src/scripts/*.js')
        .pipe(gulp.dest(paths.scripts.dest));
}

// галповский вотчер
function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.scripts.src, scripts);
}

// локальный сервер + livereload (встроенный)
function server() {
    browserSync.init({
        server: paths.root
    });
    browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
}

// ужимаем и переносим картинки
function images() {
    return gulp.src(paths.images.src)
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(paths.images.dest));
}

//переносим шрифты

function fonts() {
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest));
}

function sprite() {
    return gulp.src(paths.sprite.src)
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css'
        }))
        .pipe(gulp.dest(paths.sprite.dest));
}

function spritessvg() {
    return gulp.src(paths.svgsprite.src)
        .pipe(svgSprite(
            config = {
                mode: {
                    css: true,
                    inline: true,
                    symbol: true
                }
            }
        ))
        .pipe(gulp.dest(paths.svgsprite.dest));
}


exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.images = images;

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, templates, images, sprite, spritessvg, fonts, scripts),
    gulp.parallel(watch, server)
));