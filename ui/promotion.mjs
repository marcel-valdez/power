import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {PieceType, Side} from '../core/power.common.mjs';


const html = htm.bind(h);

class PromoCellUi extends Component {
  getCellHtmlContent(pieceType, side) {
    switch(pieceType) {
    case PieceType.KNIGHT:
      return side == Side.WHITE ? '♘' : '♞';
    case PieceType.ROOK:
      return side == Side.WHITE ? '♖' : '♜';
    default:
      throw 'Piece type ${piece.type} is not a valid promotion type.';
    }
  }

  render({
    onClick = () => {},
    type = PieceType.ROOK,
    side = Side.WHITE
  }, {}) {
    const content = this.getCellHtmlContent(type, side);
    return html`<td class='square' onClick=${() => onClick()}>${content}</td>`;
  }
}

export class PromotionUi extends Component {

  render({
    onClick = (type = PieceType.ROOK) => {},
    side = Side.WHITE }, { }) {
    return html`<table class='power-table modal'>
<tr class='power-row'>
<${PromoCellUi}
  side=${side}
  type=${PieceType.KNIGHT}
  onClick=${() => onClick(PieceType.KNIGHT)} />
<${PromoCellUi}
  side=${side}
  type=${PieceType.ROOK}
  onClick=${() => onClick(PieceType.ROOK)} />
</tr>
</table>`;
  }
}
