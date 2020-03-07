import {html, Component} from '../ui/renderer.mjs';


export class UndoButton extends Component {
  render({ onClick = () => {} }, { }) {
    return html`<button title="Undo last action" class='btn' type='button' onClick=${onClick}>
⤺
</button>`;
  }
}
