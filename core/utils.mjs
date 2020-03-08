let DEBUG = false;
let INFO = true;
let WARNING = true;
let ERROR = true;
let DISABLE_LOGGING = false;

const enableDebug = () => {
  DEBUG = true;
};

const disableInfo = () => {
  INFO = false;
  DEBUG = false;
};

const disableWarning = () => {
  WARNING = false;
  disableInfo();
};

const disableError = () => {
  ERROR = false;
  disableWarning();
};

const disableLogging = () => {
  DISABLE_LOGGING = true;
};

const log = (msg) => !DISABLE_LOGGING && console && console.log(msg);
const debug = (msg) => DEBUG && log('DEBUG: ' + msg);
const info = (msg) => INFO && log('INFO: ' + msg);
const warn = (msg) => WARNING && log('WARN: ' + msg);
const error = (msg) => ERROR && log('ERROR: ' + msg);

const isNotNullOrUndefined = (obj) => {
  return typeof(obj) !== 'undefined' &&
    obj !== null;
};

const isNullOrUndefined = (obj) => {
  return !isNotNullOrUndefined(obj);
};

export default {
  disableInfo,
  disableWarning,
  disableError,
  disableLogging,
  enableDebug,
  debug,
  info,
  warn,
  error,
  log,
  isNullOrUndefined,
  isNotNullOrUndefined
};
