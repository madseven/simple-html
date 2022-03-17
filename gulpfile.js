const {src, dest, watch, parallel, series} = require('gulp')
const scss = require ('gulp-sass') (require ('sass'))
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
const group_media = require('gulp-group-css-media-queries')
const clean_css = require('gulp-clean-css')
const twig = require('gulp-twig')
const babel = require('gulp-babel')
const webpack = require('webpack-stream')
const minify = require('gulp-babel-minify')
const sourcemaps = require('gulp-sourcemaps')
const port = 3000
const mode_start = false
const mode_nuxt = false

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'dist/',
			port,
			notify: false
		}
	});
}

function clean() {
	return del('dist')
}

function assets() {
	return src('src/assets/**/*')
		.pipe(dest('dist/assets'))
		.pipe(browserSync.stream())
}

let webpack_config = {
    output: {
        filename: 'script.js'
    },
    mode: !mode_start ? 'development' : 'production',
    devtool: 'eval-source-map'
}

function js() {
	src(['src/js/*.js', '!src/js/script.js']).pipe(dest('dist/js'))

    return src('src/js/script.js')
        .pipe(sourcemaps.init())
        .pipe(webpack(webpack_config))
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(minify({
            removeConsole: true,
            removeDebugger: true
        }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream())
}


function css() {
	let set;

	if (!mode_nuxt) {
		set = src('src/assets/scss/style.scss')
		.pipe(scss({
			outputStyle: 'expanded'
		}))
		.pipe(
			group_media()
		)
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ['last 10 versions'],
			cascade: true
		}))
		.pipe(clean_css())
		.pipe(concat('style.min.css'))
		.pipe(dest('dist/assets/css'))
		.pipe(browserSync.stream())
	} else {
		set = src('src/assets/scss/style.scss')
		.pipe(scss({
			outputStyle: 'expanded'
		}))
		.pipe(clean_css())
		.pipe(concat('style.min.css'))
		.pipe(dest('dist/assets/css'))
		.pipe(browserSync.stream())
	}
	return set
}

function html() {
	return src(['src/pages/!(_*).html'])
        .pipe(twig({
            data: {
                title: 'Gulp and Twig',
                benefits: [
                    'Fast',
                    'Flexible',
                    'Secure'
                ]
            }
        }))
        .pipe(dest('./dist'))
		.pipe(browserSync.stream())
}

function build() {
	return src([
		'src/assets/fonts/**/*',
	], {base: 'src'}) 
		.pipe(dest('dist/assets'))
}

function watchFiles() {
	watch(['src/assets/scss/**/*'], css)
	watch(['src/js/**/*.js'], js)	
	watch(['!src/pages/_start-page.html', 'src/pages/**/*'], html)
	watch(['src/assets/**/*'], assets)
}

exports.css = css;
exports.watchFiles = watchFiles;
exports.browsersync = browsersync;
exports.js = js;
exports.html = html;
exports.assets = assets;
exports.clean = clean;

exports.build = series(clean, assets, build, html, css, js);
exports.default = series(clean, parallel(build, css, js, browsersync, watchFiles, html, assets));

