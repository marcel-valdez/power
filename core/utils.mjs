// jshint esversion: 6

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
    this.message = message;
  }
}

let DEBUG = false;
let INFO = true;
let WARNING = true;
let ERROR = true;
let DISABLE_LOGGING = false;

const enableDebug = () => {
  DEBUG = true;
};

const disableDebug = () => {
  DEBUG = false;
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

const enableLogging = () => {
  DISABLE_LOGGING = false;
};

const log = (...msg) => !DISABLE_LOGGING && console && console.log(...msg);
const debug = (...msg) => DEBUG && log('DEBUG: ', ...msg);
const info = (...msg) => INFO && log('INFO: ', ...msg);
const warn = (...msg) => WARNING && log('WARN: ', ...msg);
const error = (...msg) => ERROR && log('ERROR: ', ...msg);

const isNotNullOrUndefined = (obj) => {
  return obj !== null && obj !== undefined;
};

const isNullOrUndefined = (obj) => {
  return !isNotNullOrUndefined(obj);
};

function timeout(timeoutMs) {
  return new Promise(resolve => setTimeout(resolve, timeoutMs));
}

function resolveTimeout(promise, timeoutMs = 100) {
  return Promise.race([
    promise,
    timeout(timeoutMs).then(() => new TimeoutError(`Timeout after ${timeoutMs} ms`))
  ]);
}

const defer = () => {
  const deferred = {
    promise: null,
    resolve: null,
    isResolved: false,
    reject: null,
    isRejected: false
  };

  deferred.promise = new Promise((_resolve, _reject) => {
    deferred.resolve = (value) => {
      if (!deferred.isResolved && !deferred.isRejected) {
        debug(`[utils.defer] Deferred promise resolved with: ${value}`);
        _resolve(value);
        deferred.isResolved = true;
      }
    };
    deferred.reject = (error) => {
      if (!deferred.isRejected && !deferred.isRejected) {
        debug(`[utils.defer] Deferred promise rejected with: ${error}`);
        _reject(error);
        deferred.isRejected = true;
      }
    };
  });

  return deferred;
};

export default {
  disableInfo,
  disableWarning,
  disableError,
  disableLogging,
  enableLogging,
  disableDebug,
  enableDebug,
  debug,
  info,
  warn,
  error,
  log,
  isNullOrUndefined,
  isNotNullOrUndefined,
  timeout,
  defer,
  resolveTimeout
};
