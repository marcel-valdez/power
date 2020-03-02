import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {Board} from '../core/board.mjs';
import {PieceType, Side} from '../core/power.common.mjs';
import {RowUi} from '../ui/row.mjs';
import {PromotionUi} from '../ui/promotion.mjs';

// Initialize htm with Preact
const html = htm.bind(h);
// TODO: In the future we probably want a different Cell type for each piece,
// right now, state is good enough.


export class BoardUi extends Component {
  state = {
    board: new Board(),
    src: null,
    dst: null,
    side: Side.WHITE
  };

  updateState(update) {
    this.setState(
          Object.assign({}, this.state, update));
  }

  getNextSide() {
    const {side} = this.state;
    return side === Side.WHITE ? Side.BLACK : Side.WHITE;
  }

  clickPiece(position = []) {
    const { src = null, dst = null, board } = this.state;
    if (board.pendingPromotion) {
      // Can't move piece until the promotion piece is selected
      return;
    }

    if (src === null || dst !== null) {
      this.markSrcPiece(position);
    } else {
      this.movePiece(position);
    }
  }

  markSrcPiece(srcPosition = []) {
    // TODO: We probably want to mark 'current move' and 'previous move'
    const [x, y] = srcPosition;
    const {board, side} = this.state;

    if (board.containsPieceAt(x, y)) {
      const srcPiece = board.getPieceAt(x, y);
      if (srcPiece.side === side) {
        this.updateState({ src: srcPosition, dst: null });
      } // else wrong piece color clicked
    } // else the user clicked on an empty square
  }

  movePiece(dstPosition = []) {
    const { board, src = null, side } = this.state;
    if (dstPosition[0] === src[0] && dstPosition[1] === src[1]) {
      // They clicked the same square, let's 'unclick' the source piece.
      this.updateState({ src: null, dst: null });
      return;
    }

    const newBoard = board.makeMove(src, dstPosition);
    let nextSide = this.getNextSide();
    let dst = dstPosition;
    if (newBoard === board) {
      // the board did not change, this means the destination move
      // is invalid.
      dst = null;
      nextSide = side;
    }

    this.updateState({
      board: newBoard,
      src,
      dst,
      side: nextSide
    });
  }

  setPromotion(type = PieceType.ROOK) {
    const { board, src, dst, side } = this.state;
    const promotedBoard = board.setPromotion(type);
    this.updateState({ board: promotedBoard });
  }

  render({ }, { board, src = [], dst = [], side = Side.WHITE }) {
    const rows = board.getRows()
          .map((row = [], y = 0) =>
               html`<${RowUi} y=${y}
                              row=${row}
                              onClickPiece=${(pos = []) => this.clickPiece(pos)}
                              markedSrc=${src}
                              markedDst=${dst} />`);
    const boardUi = html`<table class='power-table'>${rows}</table>`;
    if (board.pendingPromotion) {
      const promoOverlay =
            html`<${PromotionUi} side=${this.getNextSide()}
                                 onClick=${(type) => this.setPromotion(type)}
                 />`;
      return html`${boardUi}<BR/>${promoOverlay}`;
    } else {
      return boardUi;
    }
  }
}
