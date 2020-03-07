import { h, Component, render } from 'https://unpkg.com/preact@10.3.3?module';
import htm from 'https://unpkg.com/htm@3.0.3?module';

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
