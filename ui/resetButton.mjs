import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {Board, computePieceWinOdds} from '../core/board.mjs';
import {MoveType, PieceType, Side} from '../core/power.common.mjs';
import {RowUi} from '../ui/row.mjs';
import {PromotionUi} from '../ui/promotion.mjs';

const html = htm.bind(h);

export class ResetButton extends Component {
  render({ onClick = () => {} }, { }) {
    return html`<button class='reset-btn' type='button' onClick=${onClick}>
RESET
</button>`;
  }
}
