// !/usr/bin/env node
// jshint esversion: 8

const os = require('os');
const fs = require('fs');
const gulp = require('gulp');
const bundler = require('./bundler.js');
const terser = require('gulp-terser-js');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const minifyCSS = require('gulp-csso');
const replace = require('gulp-replace');

function bundle_minify(cb = () => {}) {
  const tmpdir = os.tmpdir();
  bundler({
    infile: 'index.mjs',
    outfile: `${tmpdir}/index.mjs`
  }).then(() =>
    gulp.src(`${tmpdir}/index.mjs`, { sourcemaps: true })
      .pipe(terser())
      .pipe(minify())
      .pipe(rename('index.mjs'))
      .pipe(gulp.dest('./dist/'))
  ).then(() => bundler({
    infile: 'ai/engineWorker.mjs',
    outfile: `${tmpdir}/engineWorker.mjs`
  })).then(() =>
    gulp.src(`${tmpdir}/engineWorker.mjs`, { sourcemaps: true })
      .pipe(terser())
      .pipe(minify())
      .pipe(rename('engineWorker.mjs'))
      .pipe(gulp.dest('./dist/ai/'))
  ).then(() => cb());
}

function resources(cb = () => {}) {
  let gaHtml = '';
  if (process.env.NODE_ENV === 'production') {
    gaHtml = fs.readFileSync('./prod/google_analytics.html');
  }

  gulp.src('index.html')
    .pipe(replace('<!-- google_analytics -->', gaHtml))
    .pipe(gulp.dest('./dist/'));

  gulp.src('index.css')
    .pipe(minifyCSS())
    .pipe(rename('index.css'))
    .pipe(gulp.dest('./dist/'));

  gulp.src('ui/thinking.gif')
    .pipe(gulp.dest('./dist/ui/'));

  cb();
}

exports.resources = resources;
exports.bundle_minify = bundle_minify;
exports.default = gulp.parallel(bundle_minify, resources);
