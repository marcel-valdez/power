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

    let content = ``;
    switch(piece.type) {
    case PieceType.KNIGHT:
      content += piece.side == Side.WHITE ? '♘' : '♞';
      break;
    case PieceType.PAWN:
      content += piece.side == Side.WHITE ? '♙' : '♟';
      break;
    case PieceType.ROOK:
      content += piece.side == Side.WHITE ? '♖' : '♜';
      break;
    case PieceType.KING:
      content += piece.side == Side.WHITE ? '♔' : '♚';
      break;
    default:
      throw `Piece type ${piece.type} unknown.`;
    }

    if (piece.power !== 0) {
      let classes="piece-power";
      let powerStr;
      if (piece.power < 0) {
        powerStr = `${piece.power}`;
        classes += " weak";
      } else {
        powerStr = `+${piece.power}`;
        classes += " strong";
      }

      return html`${content}
<div class="piece-power-container">
  <div class="${classes}">${powerStr}</div>
</div>`;
    } else {
      return html`${content}`;
    }
  }

  getHtmlClassForMoveValidity(isValidMovePosition = false) {
    if (isValidMovePosition) {
      return 'valid-move';
    } else {
      return '';
    }
  }

  getHtmlClassForSelection(isSelected = false) {
    if (isSelected) {
      return 'selected-piece';
    } else {
      return '';
    }
  }

  getTooltipHtmlContent(oddsForPiece = 0.0) {
    if (oddsForPiece <= 0.0) {
      return '';
    }

    return html`
<div class="battletooltip-container">
<div class="battletooltip">
${oddsForPiece*100}% odds of defeating this piece.
</div>
</div>`;
  }

  render(
    {
      piece = null,
      x = 0,
      y = 0,
      onClick = (pos = []) => {},
      isSrcPiece = false,
      isDstPiece = false,
      isSelected = false,
      isValidMovePosition = false,
      oddsForPiece = 0.0
    },
    { })
  {
    const stdHtmlContent = this.getHtmlContentForPiece(piece);
    const tooltipHtmlContent = this.getTooltipHtmlContent(oddsForPiece);
    let htmlClass = 'square' +
        ' ' + this.getHtmlClassForTurn(isSrcPiece, isDstPiece) +
        ' ' + this.getHtmlClassForSelection(isSelected) +
        ' ' + this.getHtmlClassForPosition(x, y) +
        ' ' + this.getHtmlClassForPiece(piece) +
        ' ' + this.getHtmlClassForMoveValidity(isValidMovePosition);

    const htmlContent = stdHtmlContent;
    return html`<td
      class=${htmlClass}
      onClick=${() => onClick()}>
        ${htmlContent}
        ${tooltipHtmlContent}
    </td>`;
  }
}
