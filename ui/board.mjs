// jshint esversion: 6

import seedrandom from 'seedrandom';

import {html, Component} from '../ui/renderer.mjs';
import {Board, computePieceWinOdds} from '../core/board.mjs';
import {
  GameStatus,
  MoveType,
  PieceType,
  Side
} from '../core/power.common.mjs';
import {RowUi} from '../ui/row.mjs';
import {PromotionUi} from '../ui/promotion.mjs';
import {GameEndedModal} from '../ui/gameEndedModal.mjs';
import {EngineThinkingModal} from '../ui/engineThinkingModal.mjs';
import {HelpModal} from '../ui/helpModal.mjs';
import utils from '../core/utils.mjs';
import {BottomToolbar} from './bottomToolbar.mjs';

const RANDOM = seedrandom();

const DEFAULT_STATE = Object.freeze({
  board: new Board(),
  selectedPos: null,
  src: null,
  dst: null,
  side: Side.WHITE,
  engineMoveId: 0,
  showHelp: false
});

const ENGINE_SIDE = Side.BLACK;
const HUMAN_SIDE = Side.WHITE;
const engineWorker = new Worker('ai/engineWorker.mjs', { type: 'module' });

export class BoardUi extends Component {
  constructor() {
    super();
    this.state = Object.assign({}, DEFAULT_STATE);
    this.stateStack = [DEFAULT_STATE];
  }

  updateState(update) {
    this.setState(
      Object.assign({}, this.state, update));
  }

  resetState() {
    this.stateStack = [DEFAULT_STATE];
    this.updateState(DEFAULT_STATE);
  }

  pushState(undoState) {
    const engineMoveId =
          Math.floor(undoState.engineMoveId + 1000 + (RANDOM() * 10000));
    this.stateStack.push(Object.assign({}, undoState, { engineMoveId }));
  }

  popState() {
    if (this.stateStack.length === 1) {
      utils.log('No more moves to undo.');
      return;
    }

    let oldState = this.stateStack.pop();
    // if it is the engine's turn, fire it up
    if (oldState.board.gameStatus === GameStatus.IN_PROGRESS &&
        !oldState.board.pendingPromotion &&
        oldState.side === ENGINE_SIDE) {
      oldState = this.stateStack.pop();
    }

    this.setState(oldState);
  }

  getNextSide() {
    const {side} = this.state;
    return side === Side.WHITE ? Side.BLACK : Side.WHITE;
  }

  clickPiece(position = []) {
    const { selectedPos = null, board, side } = this.state;
    if (board.pendingPromotion ||
        board.gameStatus !== GameStatus.IN_PROGRESS) {
      // Can't move piece until the promotion piece is selected or if the game
      // ended.
      return;
    }

    if (side === ENGINE_SIDE) {
      // Can't move the AI's pieces
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

  genEngineMoveHandler(id, reject, resolve) {
    const engineMoveHandler = ({data: action}) => {
      if (id !== action.engineMoveId) {
        // the event was not meant for this moveHandler, due to player undo.
        return;
      }

      if (action.engineMoveId !== this.state.engineMoveId) {
        const msg =
              `Ignored AI's move with id: ${action.engineMoveId}, ` +
              `because we expected id: ${this.state.engineMoveId}`;
        reject(msg);
      } else {
        resolve(action);
      }

      engineWorker.removeEventListener('message', engineMoveHandler);
    };

    return engineMoveHandler;
  }

  genAiMoveBoard({ src, dst }) {
    const aiMoveBoard = this.state.board.makeMove(src, dst);
    if (aiMoveBoard.pendingPromotion) {
      // TODO: Don't assume AI wants a rook.
      return aiMoveBoard.setPromotion(PieceType.ROOK);
    }

    return aiMoveBoard;
  }

  pushAiState(aiBoard, {src, dst}) {
    this.pushState(this.state);
    this.updateState({
      board: aiBoard,
      selectedPos: null,
      src: src,
      dst: dst,
      side: HUMAN_SIDE,
      engineMoveId: this.state.engineMoveId + 1
    });
  }

  engineMove(board) {
    new Promise((resolve, reject) => {
      const id = this.state.engineMoveId;
      engineWorker.postMessage({
        board: board.toJson(),
        side: ENGINE_SIDE,
        engineMoveId: id
      });
      engineWorker.addEventListener(
        'message',
        this.genEngineMoveHandler(id, reject, resolve));
    })
      .then((action) => this.pushAiState(this.genAiMoveBoard(action), action))
      .catch(console.log);
  }

  movePiece(targetPosition = []) {
    const { board, selectedPos = null } = this.state;
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

    const newState = {
      board: newBoard,
      selectedPos: null,
      src: selectedPos,
      dst: targetPosition,
      side: this.getNextSide()
    };

    this.pushState(Object.assign({}, this.state, {
      selectedPos: null
    }));
    this.updateState(newState);
    if (newBoard.gameStatus === GameStatus.IN_PROGRESS &&
        !newBoard.pendingPromotion) {
      this.engineMove(newBoard);
    }
  }

  setPromotion(type = PieceType.ROOK) {
    const { board } = this.state;
    const promotedBoard = board.setPromotion(type);
    this.updateState({ board: promotedBoard });
    this.engineMove(promotedBoard);
  }

  toggleHelpMessage() {
    const { showHelp } = this.state;
    const newShowHelp = !showHelp;
    this.updateState({ showHelp: newShowHelp });
  }

  resignGame() {
    const { board } = this.state;
    // TODO: We should use the player's color instead of hardcode
    const newBoard = board.copy({ gameStatus: GameStatus.BLACK_WON });

    this.updateState({ board: newBoard });
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
        html`
<${RowUi} y=${y}
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
<${BottomToolbar}
    resetGame=${() => this.resetState()}
    undoLastMove=${() => this.popState()}
    resignGame=${() => this.resignGame()}
    toggleHelp=${() => this.toggleHelpMessage()}
/>`;

    if (this.state.showHelp === true) {
      boardUi = html`
${boardUi}
<${HelpModal} onClick${() => this.toggleHelpMessage()}/>
`;
    } else if (board.gameStatus !== GameStatus.IN_PROGRESS) {
      boardUi = html`${boardUi}
<${GameEndedModal} gameStatus=${board.gameStatus} />`;
    } else if (board.pendingPromotion) {
      boardUi = html`
${boardUi}
<${PromotionUi}
  side=${this.getNextSide()}
  onClick=${(type) => this.setPromotion(type)}
/>`;
    } else if (side === ENGINE_SIDE) {
      boardUi = html`
${boardUi}
<${EngineThinkingModal} />
`;
    }

    return boardUi;
  }
}
