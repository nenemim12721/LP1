const { src, dest, watch, parallel } = require('gulp');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer =require('autoprefixer');
const cssnano = require('cssnano');
const ejs = require('gulp-ejs');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const bs = require('browser-sync');

sass.compiler = require('dart-sass');

/**
 * sassコンパイルタスク
 */
const compileSass = () => 
    src('src/**/*.scss')
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({
                grid: true,
            }),
            cssnano({
                autoprefixer: false,
            }),
        ]))
        .pipe(plumber({
            errorHandler: notify.onError('<%= error.message %>'),
        }))
        .pipe(dest('dist'));

/**
 * ejsコンパイルタスク
 */
const compileEjs = () => 
    src(['src/**/*.ejs', '!src/_**/*.ejs'])
        .pipe(plumber({
            errorHandler: notify.onError('<%= error.message %>'),
        }))
        .pipe(ejs({}, {}, { ext: '.html' }))
        .pipe(rename({
            extname: '.html',
        }))
        .pipe(dest('dist'));

/**
 * typescriptコンパイルタスク
 */
const compileTs = () =>
    tsProject.src()
    .pipe(tsProject())
    .js
    .pipe(dest('dist/js/'));

/**
 * htmlをdistに吐き出すだけのタスク
 */
const outputHtml = () =>
    src('src/index.html')
        .pipe(dest('dist/'));

/**
 * ブラウザシンクのタスク
 */
const browserSync = () =>
	bs.init({
		server: {
			baseDir: './',
			index: 'index.html',
		},
	});


const watchSassFilrs = () => watch('src/css/**/**.scss', compileSass).on('change', bs.reload);
const watchEjsFilrs = () => watch('src/**/*.ejs', compileEjs).on('change', bs.reload);
const watchTsFiles = () => watch('src/js/**/**.ts', compileTs).on('change', bs.reload);
const watchHtmlFiles = () => watch('src/index.html', outputHtml).on('change', bs.reload);

exports.default = parallel(watchSassFilrs, watchEjsFilrs, watchTsFiles, watchHtmlFiles, browserSync);