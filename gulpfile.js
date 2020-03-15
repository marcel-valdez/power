
const gulp = require('gulp');
const rollup = require('gulp-rollup');
const terser = require('gulp-terser-js');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const minifyCSS = require('gulp-csso');

function bundle_minify(cb = () => {}) {

  gulp.src(['ai/*.mjs', 'ui/*.mjs', 'core/*.mjs', 'index.mjs'], { sourcemaps: true })
    .pipe(rollup({
      input: 'index.mjs',
      output: {
        format: 'es'
      }
    }))
    .pipe(terser())
    .pipe(minify())
    .pipe(rename('index.mjs'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['ai/*.mjs', 'core/*.mjs'])
    .pipe(rollup({
      input: 'ai/engineWorker.mjs',
      output: {
        format: 'es'
      }
    }))
    .pipe(terser())
    .pipe(minify())
    .pipe(rename('engineWorker.mjs'))
    .pipe(gulp.dest('./dist/ai/'));

  cb();
};

function resources(cb = () => {}) {
  gulp.src('index.html')
    .pipe(gulp.dest('./dist/'));

  gulp.src('index.css')
    .pipe(minifyCSS())
    .pipe(rename('index.css'))
    .pipe(gulp.dest('./dist/'));

  gulp.src('ui/thinking.gif')
    .pipe(gulp.dest('./dist/ui/'));

  cb();
};

exports.resources = resources;
exports.bundle_minify = bundle_minify;
exports.default = gulp.parallel(bundle_minify, resources);
