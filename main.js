
import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {Board} from './board.js';
import {PieceType, Side} from './power.common.js'

// Initialize htm with Preact
const html = htm.bind(h);
// TODO: In the future we probably want a different Cell type for each piece, right now, state is good enough.
export class CellUi extends Component {

  getHtmlClassForSide(side = Side.WHITE) {
    if (side === Side.WHITE) {
      return 'white-piece';
    } else {
      return 'black-piece';
    }
  }

  getHtmlClassForPosition(x = 0, y = 0) {
    if (x % 2 == 0) {
      if (y % 2 == 0) {
        return 'white-square';
      } else {
        return 'black-square';
      }
    } else {
      if (y % 2 == 0) {
        return 'black-square';
      } else {
        return 'white-square';
      }
    }
  }

  getHtmlClassForPieceType(pieceType = PieceType.KNIGHT) {
    switch(pieceType) {
    case PieceType.KNIGHT:
      return 'knight';
      break;
    default:
      throw 'Piece type ${piece.type} unknown.';
    }
  }

  getHtmlClassForPiece(piece = null) {
    if (piece === null) {
      return 'empty';
    } else {
      return this.getHtmlClassForSide(piece.side) + ' ' +
        this.getHtmlClassForPieceType(piece.type);
    }
  }

  getHtmlClassForTurn(isTurnSrc = false, isTurnDst = false) {
    if (isTurnSrc) {
      return 'src-piece';
    } else if(isTurnDst) {
      return 'dst-piece';
    } else {
      return '';
    }
  }

  getHtmlContentForPiece(piece = null) {
    if (piece === null) {
      return '';
    }

    switch(piece.type) {
    case PieceType.KNIGHT:
      return piece.side == Side.WHITE ? '♘' : '♞';
      break;
    default:
      throw 'Piece type ${piece.type} unknown.';
    }
  }

  render(
    {
      piece = null,
      rowIdx = 0,
      colIdx = 0,
      onClick = (pos = []) => {},
      isSrcPiece = false,
      isDstPiece = false
    },
    { })
  {
    const htmlContent = this.getHtmlContentForPiece(piece);
    let htmlClass = 'square' +
        ' ' + this.getHtmlClassForTurn(isSrcPiece, isDstPiece) +
        ' ' + this.getHtmlClassForPosition(colIdx, rowIdx) +
        ' ' + this.getHtmlClassForPiece(piece);

    return html`<td
      class=${htmlClass}
      onClick=${() => onClick()}>
        ${htmlContent}
    </td>`;
  }
}

export class RowUi extends Component {
  render(
    {
      rowIdx = 0,
      row = [],
      markedSrc = [],
      markedDst = [],
      onClickPiece = (pos = []) => {},
    },
    { }) {
    const [srcX = -1, srcY = -1] = markedSrc || [];
    const [dstX = -1, dstY = -1] = markedDst || [];
    return html`<tr class='power-row'>${
      row.map((piece = null, colIdx = 0) => html`<${CellUi}
        rowIdx=${rowIdx}
        colIdx=${colIdx}
        piece=${piece}
        isSrcPiece=${colIdx === srcX && rowIdx === srcY}
        isDstPiece=${colIdx === dstX && rowIdx === dstY}
        onClick=${() => onClickPiece([colIdx, rowIdx])}
      />`)
    }</tr>`;
  }
}

export class BoardUi extends Component {
  state = {
    board: new Board(),
    src: null,
    dst: null,
  };

  clickPiece(position = []) {
    const { src = null, dst = null } = this.state;
    if (src === null || dst !== null) {
      this.markSrcPiece(position);
    } else {
      this.movePiece(position);
    }
  }

  markSrcPiece(srcPosition = []) {
    // TODO: We probably want to mark 'current move' and 'previous move'
    const [x, y] = srcPosition;
    const {board} = this.state;
    if (board.containsPieceAt(x, y)) {
      this.setState(
        Object.assign({}, this.state, { src: srcPosition, dst: null }));
    } // else the user clicked on an empty square
  }

  movePiece(dstPosition = []) {
    const { board, src = null } = this.state;
    this.setState({
      board: board.makeMove(src, dstPosition),
      src,
      dst: dstPosition
    });
  }

  render({ }, { board, src = [], dst = [] }) {
    const rows = board.getRows()
          .map((row = [], rowIdx = 0) =>
               html`<${RowUi} rowIdx=${rowIdx}
                              row=${row}
                              onClickPiece=${(pos = []) => this.clickPiece(pos)}
                              markedSrc=${src}
                              markedDst=${dst} />`);
    return html`<table class='power-table'>${rows}</table>`;
  }
}

// NOTE: When we start receiving board updates from the server, we will have to
// pass back & forth the board's state, therefore it'll be props, not state.
const app = html`<${BoardUi} />`;
render(app, document.getElementById('power'));
