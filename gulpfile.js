const {src, dest, watch, parallel, series} = require('gulp'),
	scss = require ('gulp-sass') (require ('sass')),
	concat = require('gulp-concat'),
	browserSync = require('browser-sync').create(),
	uglify = require('gulp-uglify-es').default,
	autoprefixer = require('gulp-autoprefixer'),
	// imagemin = require('gulp-imagemin'),
	del = require('del'),
	webp = require('gulp-webp'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	twig = require('gulp-twig'),
	babel = require('gulp-babel'),
	webpack = require('webpack-stream'),
	minify = require('gulp-babel-minify'),
	sourcemaps = require('gulp-sourcemaps');

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'dist/',
			port: 3000,
			notify: false
		}
	});
}

function clean() {
	return del('dist')
}

function assets() {
	return src('src/assets/**/*')
		// .pipe(imagemin([
		// 	imagemin.gifsicle({interlaced: true}),
		// 	imagemin.mozjpeg({quality: 75, progressive: true}),
		// 	imagemin.optipng({optimizationLevel: 5}),
		// 	imagemin.svgo({
		// 		plugins: [
		// 			{removeViewBox: true},
		// 			{cleanupIDs: false}
		// 		]
		// 	})
		// ]))
		// .pipe(
		// 	webp({
		// 		quality: 70
		// 	})
		// )	
		.pipe(dest('dist/assets'))
		.pipe(browserSync.stream())
}

let webpack_config = {
    output: {
        filename: 'script.js'
    },
    mode: 'development',
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
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream())
}

// function js() {
// 	function js() {
// 	src(['src/js/*.js', '!src/js/script.js'])
// 		.pipe(dest('dist/js'))

// 	return src([
// 		'src/js/script.js'
// 	])
// 	.pipe(concat('script.min.js'))
// 	.pipe(uglify())
// 	.pipe(dest('dist/js'))
// 	.pipe(browserSync.stream())
// }

// 	return src([
// 		'src/js/*.js'
// 	])
// 	.pipe(concat('script.min.js'))
// 	.pipe(uglify())
// 	.pipe(dest('dist/js'))
// 	.pipe(browserSync.stream())
// }

function css() {
	return src('src/scss/style.scss')
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
		.pipe(dest('dist/css'))
		.pipe(browserSync.stream())
}

function html() {
	return src('src/pages/*.html')
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
		'src/fonts/**/*',
	], {base: 'src'}) 
		.pipe(dest('dist'))
}

function watchFiles() {
	watch(['src/scss/**/*.scss'], css)
	watch(['src/js/**/*.js', '!src/js/script.min.js'], js)	
	watch(['src/pages/**/*.html'], html)
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

