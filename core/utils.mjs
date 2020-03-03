
let DEBUG = false;
let DISABLE_LOGGING = false;

const enableDebug = () => {
  DEBUG = true;
};

const disableLogging = () => {
  DISABLE_LOGGING = true;
};

const log = (msg) => !DISABLE_LOGGING && console && console.log(msg);
const debug = (msg) => DEBUG && log('DEBUG: ' + msg);
const info = (msg) => log('INFO: ' + msg);
const warn = (msg) => log('WARN: ' + msg);
const error = (msg) => log('ERROR: ' + msg);


export default {
  disableLogging,
  enableDebug,
  debug,
  info,
  warn,
  error,
  log
}
