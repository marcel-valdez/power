import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {PieceType, Side} from '../core/power.common.mjs';

// Initialize htm with Preact
const html = htm.bind(h);
// TODO: In the future we probably want a different Cell type for each piece,
// right now, state is good enough.

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
    case PieceType.PAWN:
      return 'pawn';
    case PieceType.ROOK:
      return 'rook';
    case PieceType.KING:
      return 'king';
    default:
      throw `Piece type ${pieceType} unknown.`;
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
    case PieceType.PAWN:
      return piece.side == Side.WHITE ? '♙' : '♟';
    case PieceType.ROOK:
      return piece.side == Side.WHITE ? '♖' : '♜';
    case PieceType.KING:
      return piece.side == Side.WHITE ? '♔' : '♚';
    default:
      throw `Piece type ${piece.type} unknown.`;
    }
  }

  getHtmlClassForMoveValidity(isValidMovePosition = false) {
    if (isValidMovePosition) {
      return 'valid-move';
    } else {
      return '';
    }
  }

  render(
    {
      piece = null,
      x = 0,
      y = 0,
      onClick = (pos = []) => {},
      isSrcPiece = false,
      isDstPiece = false,
      isValidMovePosition = false
    },
    { })
  {
    const htmlContent = this.getHtmlContentForPiece(piece);
    let htmlClass = 'square' +
        ' ' + this.getHtmlClassForTurn(isSrcPiece, isDstPiece) +
        ' ' + this.getHtmlClassForPosition(x, y) +
        ' ' + this.getHtmlClassForPiece(piece) +
        ' ' + this.getHtmlClassForMoveValidity(isValidMovePosition);

    return html`<td
      class=${htmlClass}
      onClick=${() => onClick()}>
        ${htmlContent}
    </td>`;
  }
}
