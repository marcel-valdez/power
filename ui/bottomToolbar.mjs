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
    let component = html`
<div class='btn-container'>
  <${ResetButton} onClick=${resetGame} />
  <${UndoButton} onClick=${undoLastMove} />
  <${HelpButton} onClick=${toggleHelp} />
  <${ResignButton} onClick=${resignGame} />
</div>`;

    return component;
  }
}