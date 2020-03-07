import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {Board, computePieceWinOdds} from '../core/board.mjs';
import {
  GameStatus,
  MoveType,
  PieceType,
  Side
} from '../core/power.common.mjs';
import {RowUi} from '../ui/row.mjs';
import {PromotionUi} from '../ui/promotion.mjs';
import {ResetButton} from '../ui/resetButton.mjs';
import {GameEndedModal} from '../ui/gameEndedModal.mjs';

const html = htm.bind(h);

const DEFAULT_STATE = Object.freeze({
  board: new Board(),
  selectedPos: null,
  src: null,
  dst: null,
  side: Side.WHITE
});
export class BoardUi extends Component {
  state = Object.assign({}, DEFAULT_STATE);

  updateState(update) {
    this.setState(
          Object.assign({}, this.state, update));
  }

  resetState() {
    this.updateState(DEFAULT_STATE);
  };


  getNextSide() {
    const {side} = this.state;
    return side === Side.WHITE ? Side.BLACK : Side.WHITE;
  }

  clickPiece(position = []) {
    const { selectedPos = null, board } = this.state;
    if (board.pendingPromotion) {
      // Can't move piece until the promotion piece is selected
      return;
    }

    if (selectedPos === null) {
      this.markSelectedPiece(position);
    } else {
      this.movePiece(position);
    }
  }

  markSelectedPiece(selectedPos = []) {
    const [x, y] = selectedPos;
    const {board, side} = this.state;

    if (board.containsPieceAt(x, y)) {
      const selPiece = board.getPieceAt(x, y);
      if (selPiece.side === side) {
        this.updateState({ selectedPos });
      } // else wrong piece color clicked
    } // else the user clicked on an empty square
  }

  movePiece(targetPosition = []) {
    const { board, selectedPos = null, src = null, side } = this.state;
    if (targetPosition[0] === selectedPos[0] &&
        targetPosition[1] === selectedPos[1]) {
      // They clicked the same square, let's unselect the piece.
      this.updateState({ selectedPos: null });
      return;
    }

    const newBoard = board.makeMove(selectedPos, targetPosition);
    if (newBoard === board) {
      // the board did not change, this means the destination move
      // is invalid, do nothing.
      return;
    }

    this.updateState({
      board: newBoard,
      selectedPos: null,
      src: selectedPos,
      dst: targetPosition,
      side: this.getNextSide()
    });
  }

  setPromotion(type = PieceType.ROOK) {
    const { board } = this.state;
    const promotedBoard = board.setPromotion(type);
    this.updateState({ board: promotedBoard });
  }

  render(
    { },
    {
      board,
      selectedPos = [],
      src = [],
      dst = [],
      side = Side.WHITE
    }) {

    const isValidMovePositionFn = (x2,y2) => {
      // if no src piece has been selected or both src and dst pieces
      // have already been selected, don't highlight anything.
      if (selectedPos === null) {
        return false;
      }

      const [x1, y1] = selectedPos;
      const selPiece = board.getPieceAt(x1, y1);
      return MoveType.INVALID !== selPiece.computeMoveType(board, x2, y2);
    };

    const oddsForPieceFn = (x2, y2) => {
      if (selectedPos === null) {
        return 0.0;
      }

      if (!isValidMovePositionFn(x2,y2)) {
        return 0.0;
      }

      if (!board.containsPieceAt(x2, y2)) {
        return 0.0;
      }

      const [x1, y1] = selectedPos;
      const attacker = board.getPieceAt(x1, y1);
      const defender = board.getPieceAt(x2, y2);

      if (attacker.isAlly(defender)) {
        return 0.0;
      }

      return computePieceWinOdds(attacker, defender);
    };

    const rows = board.getRows()
          .map((row = [], y = 0) =>
               html`<${RowUi} y=${y}
                              row=${row}
                              onClickPiece=${(pos = []) => this.clickPiece(pos)}
                              isValidMovePositionFn=${isValidMovePositionFn}
                              oddsForPieceFn=${oddsForPieceFn}
                              selectedPos=${selectedPos}
                              markedSrc=${src}
                              markedDst=${dst} />`);
    let boardUi = html`
<div class='board-container'>
  <table class='power-table'>${rows}</table>
</div>
<div class='reset-btn-container'>
  <${ResetButton} onClick=${() => this.resetState()} />
</div>`;

    if (board.gameStatus !== GameStatus.IN_PROGRESS) {
      boardUi = html`${boardUi}
<${GameEndedModal} gameStatus=${board.gameStatus} />`;
    } else if (board.pendingPromotion) {
      boardUi = html`
${boardUi}
<${PromotionUi}
  side=${this.getNextSide()}
  onClick=${(type) => this.setPromotion(type)}
/>`;
    }

    return boardUi;
  }
}
