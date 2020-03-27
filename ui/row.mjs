// jshint esversion: 6

import {html, Component} from '../ui/renderer.mjs';
import {CellUi} from '../ui/cell.mjs';


export class RowUi extends Component {
  render(
    {
      y = 0,
      row = [],
      selectedPos = [],
      markedSrc = [],
      markedDst = [],
      onClickPiece = (pos = []) => {},
      isValidMovePositionFn = (x, y) => false,
      oddsForPieceFn = (x, y) => 0.0
    },
    { }) {

    const [selX = -1, selY = -1] = selectedPos || [];
    const [srcX = -1, srcY = -1] = markedSrc || [];
    const [dstX = -1, dstY = -1] = markedDst || [];
    const pieces = row.map((piece = null, x = 0) => html`<${CellUi}
    x=${x}
    y=${y}
    piece=${piece}
    isSelected=${x === selX && y === selY}
    isSrcPiece=${x === srcX && y === srcY}
    isDstPiece=${x === dstX && y === dstY}
    onClick=${() => onClickPiece([x, y])}
    isValidMovePosition=${isValidMovePositionFn(x, y)}
    oddsForPiece=${oddsForPieceFn(x, y)}
      />`);

    return html`<tr class='power-row'>${pieces}</tr>`;
  }
}
