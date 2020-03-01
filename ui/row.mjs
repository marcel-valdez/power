import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {CellUi} from '/ui/cell.mjs';


// Initialize htm with Preact
const html = htm.bind(h);

export class RowUi extends Component {
  render(
    {
      rowIdx = 0,
      row = [],
      markedSrc = [],
      markedDst = [],
      onClickPiece = (pos = []) => {}
    },
    { }) {
    const [srcX = -1, srcY = -1] = markedSrc || [];
    const [dstX = -1, dstY = -1] = markedDst || [];
    const pieces = row.map((piece = null, colIdx = 0) => html`<${CellUi}
    rowIdx=${rowIdx}
    colIdx=${colIdx}
    piece=${piece}
    isSrcPiece=${colIdx === srcX && rowIdx === srcY}
    isDstPiece=${colIdx === dstX && rowIdx === dstY}
    onClick=${() => onClickPiece([colIdx, rowIdx])}
      />`);

    return html`<tr class='power-row'>${pieces}</tr>`;
  }
}
