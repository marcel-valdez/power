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

function bundle({
  filename,
  src = '.',
  dest = './dist'
}) {
  const tmpdir = os.tmpdir();
  return bundler({
    infile: `${src}/${filename}`,
    outfile: `${tmpdir}/${filename}`
  })
    .then(() => gulp.src(`${tmpdir}/${filename}`, { sourcemaps: true })
      .pipe(terser())
      .pipe(minify())
      .pipe(rename(filename))
      .pipe(gulp.dest(dest)));
}

function bundle_minify(cb = () => { }) {
  const INDEX_FILE = 'index.mjs';
  const ENGINE_WORKER_FILE = 'engineWorker.mjs';
  const MATCHMAKING_WORKER_FILE = 'matchmakingWorker.mjs';
  return bundle({
    filename: INDEX_FILE,
    src: '.',
    dest: './dist'
  })
  .then(() => bundle({
    filename: ENGINE_WORKER_FILE,
    src: './ai',
    dest: './dist/ai'
  }))
  .then(() => bundle({
    filename: MATCHMAKING_WORKER_FILE,
    src: './client',
    dest: './dist/client'
  }))
  .then(() => cb());
}

function resources(cb = () => { }) {
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
