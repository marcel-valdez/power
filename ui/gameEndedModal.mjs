import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {GameStatus} from '../core/power.common.mjs';


const html = htm.bind(h);

export class GameEndedModal extends Component {
  render({ gameStatus = GameStatus.WHITE_WON }, { }) {
    let message = '';
    if (gameStatus === GameStatus.WHITE_WON) {
      message = '♔ White won!';
    } else if (gameStatus === GameStatus.BLACK_WON) {
      message = '♚ Black Won!';
    } else {
      throw `Invalid game status for modal: ${gameStatus}`;
    }

    return html`<div class='modal game-result'>${message}</div>`;
  }
}
