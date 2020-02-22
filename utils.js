
let DEBUG = false;

const enableDebug = () => {
    DEBUG = true;
};

const log = (msg) => console && console.log(msg);
const debug = (msg) => DEBUG && log('DEBUG: ' + msg);
const info = (msg) => log('INFO: ' + msg);
const warn = (msg) => log('WARN: ' + msg);
const error = (msg) => log('ERROR: ' + msg);


export default {
    enableDebug,
    debug,
    info,
    warn,
    error,
    log
}
