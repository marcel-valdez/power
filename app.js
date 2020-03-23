#!/usr/bin/env node

const yargs = require('yargs');
const express = require('express');


function main({ port, staticPath }) {
  const app = express();
  app.use(express.static(staticPath));
  app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
    console.log(`Static path is: ${staticPath}.`);
  });
}

function parseArgs() {
  return yargs
    .option('port', {
      alias: 'p',
      describe: 'Set the port on which to host the app',
      type: 'number',
      default: 80
    })
    .option('static_path', {
      alias: 's',
      describe: 'Path on which to host static files',
      type: 'string',
      default: 'dist'
    })
    .help()
    .alias('help', 'h')
    .wrap(80)
    .argv;
}

if (require.main === module) {
  const { static_path, port } = parseArgs();
  main({ port, staticPath: static_path });
}
