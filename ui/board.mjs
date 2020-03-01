
import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {Board} from '/core/board.mjs';
import {PieceType, Side} from '/core/power.common.mjs';
import {RowUi} from '/ui/row.mjs';

// Initialize htm with Preact
const html = htm.bind(h);
// TODO: In the future we probably want a different Cell type for each piece,
// right now, state is good enough.


export class BoardUi extends Component {
  state = {
    board: new Board(),
    src: null,
    dst: null
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
    if (dstPosition[0] === src[0] && dstPosition[1] === src[1]) {
      // They clicked the same square, let's 'unclick' the source piece.
      this.setState({ board, src: null, dst: null });
      return;
    }
    const newBoard = board.makeMove(src, dstPosition);
    let dst = dstPosition;
    if (newBoard === board) {
      // the board did not change, this means the destination move
      // is invalid.
      dst = null;
    }

    this.setState({
      board: newBoard,
      src,
      dst
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
