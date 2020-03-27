// jshint esversion: 6

import {html, Component} from '../ui/renderer.mjs';


export class ResetButton extends Component {
  render({ onClick = () => {} }, { }) {
    return html`
<button
  class='btn'
  type='button'
  title='Reset the board to initial state.'
  onClick=${onClick}>
RESET
</button>`;
  }
}
