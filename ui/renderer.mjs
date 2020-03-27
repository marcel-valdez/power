// jshint esversion: 6

import { h, Component, render } from 'preact';
import htm from 'htm';


/**
 * Wrapper module to be the only place where 3rd party libraries imported.
 */

const html = htm.bind(h);
export {
  html,
  Component,
  render
};
