// jshint esversion: 6

import {html, Component} from '../ui/renderer.mjs';


export class ResignButton extends Component {
  render({ onClick = () => {} }, { }) {
    return html`
  <button
    class='btn'
    type='button'
    title='Forfeit the game.'
    onClick=${onClick}>Resign</button>`;
  }
}