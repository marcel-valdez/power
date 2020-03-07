import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

const html = htm.bind(h);

export class UndoButton extends Component {
  render({ onClick = () => {} }, { }) {
    return html`<button title="Undo last action" class='btn' type='button' onClick=${onClick}>
⤺
</button>`;
  }
}
