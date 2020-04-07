// jshint esversion: 6


import { html, Component } from '../ui/renderer.mjs';
import { Board, computePieceWinOdds } from '../core/board.mjs';
import {
  GameStatus,
  MoveType,
  PieceType,
  Side
} from '../core/power.common.mjs';
import { RowUi } from '../ui/row.mjs';
import { PromotionUi } from '../ui/promotion.mjs';
import { GameEndedModal } from '../ui/gameEndedModal.mjs';
import { EngineThinkingModal } from '../ui/engineThinkingModal.mjs';
import { HelpModal } from '../ui/helpModal.mjs';
import utils from '../core/utils.mjs';
import { BottomToolbar } from './bottomToolbar.mjs';
import WorkerClient from '../client/matchmakingWorkerClient.mjs';
import EngineClient from '../ai/engineWorkerClient.mjs';


const DEFAULT_STATE = Object.freeze({
  board: new Board(),
  selectedPos: null,
  src: null,
  dst: null,
  side: Side.WHITE,
  showHelp: false,
  playerSide: Side.WHITE,
  opponentSide: Side.BLACK
});


const matchMakingWorker = WorkerClient({
  onConnected: () => {
    console.log('onConnected');
  },
  onDisconnected: () => {
    console.log('onDisconnected');
  },
  onMatchStarted: () => {
    console.log('onMatchStarted');
  },
  onBoardUpdate: () => {
    console.log('onBoardUpdate');
  }
});


export class BoardUi extends Component {
  constructor() {
    super();
    this.state = Object.assign({}, DEFAULT_STATE);
    this.stateStack = [DEFAULT_STATE];
    this.engineClient = EngineClient({
      onEngineMove: (...data) => this.onEngineMove(...data)
    });
  }

  get playerSide() {
    return this.state.playerSide;
  }

  get opponentSide() {
    return this.state.opponentSide;
  }

  get showHelp() {
    return this.state.showHelp;
  }

  get currentSide() {
    return this.state.side;
  }

  get src() {
    return this.state.src;
  }

  get dst() {
    return this.state.dst;
  }

  get board() {
    return this.state.board;
  }

  get selectedPos() {
    return this.state.selectedPos;
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
    this.engineClient.ignoreIncomingMove();
    this.stateStack.push(Object.assign({}, undoState));
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
      oldState.side === this.opponentSide) {
      oldState = this.stateStack.pop();
    }

    this.setState(oldState);
  }

  getNextSide() {
    return this.currentSide === Side.WHITE ? Side.BLACK : Side.WHITE;
  }

  clickPiece(position = []) {
    if (this.board.pendingPromotion ||
      this.board.gameStatus !== GameStatus.IN_PROGRESS) {
      // Can't move piece until the promotion piece is selected or if the game
      // ended.
      return;
    }

    if (this.currentSide === this.opponentSide) {
      // Can't move the AI's pieces
      return;
    }

    if (this.selectedPos === null) {
      this.markSelectedPiece(position);
    } else {
      this.movePiece(position);
    }
  }

  markSelectedPiece(selectedPos = []) {
    const [x, y] = selectedPos;

    if (this.board.containsPieceAt(x, y)) {
      const selPiece = this.board.getPieceAt(x, y);
      if (selPiece.side === this.currentSide) {
        this.updateState({ selectedPos });
      } // else wrong piece color clicked
    } // else the user clicked on an empty square
  }

  // TODO: This should be handled by an 'engineWorkerClient'
  onEngineMove(move) {
    this.onOpponentMove(this.genAiMoveBoard(move), move);
  }

  // TODO: Receive a board from the engineClient, instead of
  //       source and destination.
  genAiMoveBoard({ src, dst }) {
    const newBoard = this.board.makeMove(src, dst);
    if (newBoard.pendingPromotion) {
      // TODO: Don't assume AI wants a rook.
      return newBoard.setPromotion(PieceType.ROOK);
    }

    return newBoard;
  }

  onOpponentMove(newBoard, { src, dst }) {
    this.pushState(this.state);
    this.updateState({
      board: newBoard,
      selectedPos: null,
      src: src,
      dst: dst,
      side: this.playerSide
    });
  }

  opponentMove(board = this.board, side = this.opponentSide) {
    // [pvp] TODO: Select engine or matchmaking client depending
    //             on current state.
    this.engineClient.makeMove(board, side);
  }

  movePiece(targetPosition = []) {
    if (targetPosition[0] === this.selectedPos[0] &&
      targetPosition[1] === this.selectedPos[1]) {
      // They clicked the same square, let's unselect the piece.
      this.updateState({ selectedPos: null });
      return;
    }

    const newBoard = this.board.makeMove(this.selectedPos, targetPosition);
    if (newBoard === this.board) {
      // the board did not change, this means the destination move
      // is invalid, do nothing.
      return;
    }

    // [pvp] TODO: Instead of this, send the move through the client
    //             unless there is a pending promotion, then we do it
    //             locally and once the promotion has been selected,
    //             we issue the move to the server.
    const newState = {
      board: newBoard,
      selectedPos: null,
      src: this.selectedPos,
      dst: targetPosition,
      side: this.getNextSide()
    };

    this.pushState(Object.assign({}, this.state, {
      selectedPos: null
    }));
    this.updateState(newState);
    if (newBoard.gameStatus === GameStatus.IN_PROGRESS &&
      !newBoard.pendingPromotion) {
      this.opponentMove(newBoard, this.opponentSide);
    }
  }

  setPromotion(type = PieceType.ROOK) {
    const promotedBoard = this.board.setPromotion(type);
    // [pvp] TODO: If we're in PvP mode, we should send the
    // promotion decision and wait for an update.
    this.updateState({ board: promotedBoard });
    this.opponentMove(promotedBoard, this.opponentSide);
  }

  toggleHelpMessage() {
    this.updateState({ showHelp: !this.showHelp });
  }

  resignGame() {
    const winner = this.opponentSide == Side.WHITE ?
      GameStatus.WHITE_WON : GameStatus.BLACK_WON;

    const newBoard = this.board.copy({ gameStatus: winner });
    // [pvp] TODO: If we're in PvP mode, we should send a signal
    // and update the board only if we get a board update back
    this.updateState({ board: newBoard });
  }

  render(
    { },
    {
      board,
      selectedPos = [],
      src = [],
      dst = [],
      currentSide = Side.WHITE,
      showHelp = false,
      playerSide = Side.WHITE,
      opponentSide = Side.BLACK
    }) {

    const isValidMovePositionFn = (x2, y2) => {
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

      if (!isValidMovePositionFn(x2, y2)) {
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

    if (showHelp === true) {
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
    } else if (currentSide === opponentSide) {
      // [pvp] TODO: Rename the modal to WaitForMoveModal and parameterize
      //             the message displayed to the user based on the playing mode.
      boardUi = html`
${boardUi}
<${EngineThinkingModal} />
`;
    }

    return boardUi;
  }
}
