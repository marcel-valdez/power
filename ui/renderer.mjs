import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

/**
 * Wrapper module to be the only place where libraries are fetched from the
 * Internet.
 */

const html = htm.bind(h);
export {
  html,
  Component,
  render
};
