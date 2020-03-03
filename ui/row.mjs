import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {CellUi} from '../ui/cell.mjs';

const html = htm.bind(h);

export class RowUi extends Component {
  render(
    {
      y = 0,
      row = [],
      markedSrc = [],
      markedDst = [],
      onClickPiece = (pos = []) => {},
      isValidMovePositionFn = (x, y) => false
    },
    { }) {
    const [srcX = -1, srcY = -1] = markedSrc || [];
    const [dstX = -1, dstY = -1] = markedDst || [];
    const pieces = row.map((piece = null, x = 0) => html`<${CellUi}
    x=${x}
    y=${y}
    piece=${piece}
    isSrcPiece=${x === srcX && y === srcY}
    isDstPiece=${x === dstX && y === dstY}
    onClick=${() => onClickPiece([x, y])}
    isValidMovePosition=${isValidMovePositionFn(x,y)}
      />`);

    return html`<tr class='power-row'>${pieces}</tr>`;
  }
}
