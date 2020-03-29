// jshint esversion: 6

import {ResetButton} from '../ui/resetButton.mjs';
import {UndoButton} from '../ui/undoButton.mjs';
import {ResignButton} from '../ui/resignButton.mjs';
import {HelpButton} from '../ui/helpModal.mjs';
import {html, Component} from '../ui/renderer.mjs';

export class BottomToolbar extends Component {
  render({
    resetGame = () => {},
    undoLastMove = () => {},
    resignGame = () => {},
    toggleHelp = () => {},
  },
  { }) {
    return html`
<div class='btn-container'>
  <${ResetButton} onClick=${resetGame} />
  <${ResignButton} onClick=${resignGame} />
  <${UndoButton} onClick=${undoLastMove} />
  <${HelpButton} onClick=${toggleHelp} />
</div>`;
  }
}