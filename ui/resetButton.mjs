import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';


const html = htm.bind(h);

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
