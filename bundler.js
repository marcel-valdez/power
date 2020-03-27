// !/usr/bin/env node
// jshint esversion: 8


const rollup = require('rollup');
const resolve = require('@rollup/plugin-node-resolve');


async function build({ infile, outfile }) {
  const bundle = await rollup.rollup({
    input: infile,
    plugins: [
      resolve()
    ]
  });

  bundle.write({
    format: 'es',
    compact: true,
    output: {
      file: outfile
    }
  });
}

module.exports = build;