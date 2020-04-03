// jshint esversion: 8

import utils from '../core/utils.mjs';

let DISABLED = false;
export const disable = () => {
  DISABLED = true;
};
export const enable = () => {
  DISABLED = false;
};


export class PreconditionFailedError extends Error {
  constructor(message) {
    super(message);
  }
}

const NULL_OR_UNDEFINED_MSG = 'Invalid argument value, null or undefined.';

export function checkNotNullOrUndefined(
  obj, message = NULL_OR_UNDEFINED_MSG) {
  if (DISABLED) {
    return true;
  }

  if (utils.isNullOrUndefined(obj)) {
    throw new PreconditionFailedError(message);
  }

  return true;
}

export function checkArgument(predicate = () => true, message = '') {
  if (DISABLED) {
    return true;
  }

  if (!predicate()) {
    throw new PreconditionFailedError(message);
  }

  return true;
}
