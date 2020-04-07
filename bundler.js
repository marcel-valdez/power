// !/usr/bin/env node
// jshint esversion: 8


const rollup = require('rollup');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');



async function build({ infile, outfile }) {
  const bundle = await rollup.rollup({
    input: infile,
    plugins: [
      resolve(),
      commonjs()
    ]
  });

  return bundle.write({
    format: 'es',
    compact: true,
    output: {
      file: outfile
    }
  });
}

module.exports = build;