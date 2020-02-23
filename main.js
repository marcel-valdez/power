import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

// Initialize htm with Preact
const html = htm.bind(h);

const app = html`<div>Hello World!</div>`;
render(app, document.getElementById('app'));


// TODO: In the future we probably want a different Cell type for each piece, right now, state is good enough.
export class CellUi extends Component {
    render({ piece = null, onClick  = (pos = []) => {}, isSrcPiece = false, isdDstPiece = false }, { }) {
        // render by piece type
    }
}

export class RowUi extends Component {
    render({ row = [], onPieceClick = (pos = []) => {}, markedSrc = [], markedDst = [] }, { }) {
        // render pieces in a row
        return html`
            <tr>
                ${
                    row.map(piece => html`<${CellUi}
                        piece=${piece}
                        isSrcPiece=${markedSrc && piece.x === markedSrc[0] && piece.y === markedSrc[1]}
                        isDstPiece=${markedDst && piece.x === markedDst[0] && piece.y === markedDst[1]}
                        onClick=${(pos) => onPieceClick(pos)}/>
                    `);
                }
            </tr>
        `;
    }
}

export class BoardUi extends Component {
    constructor() {
        this.setState({
            board: new Board(),
            src: null,
            dst: null,
        })
    }

    clickPiece(position) {
        const { src } = this.state;
        if (src === null || dst !== null) {
            this.markSrcPiece(position);
        } else {
            this.movePiece(position);
        }
    }

    markSrcPiece(position) {
        // TODO: We probably want to mark 'current move' and 'previous move'
        this.setState(Object.assign({}, this.state, {
            src: position, dst: null
        }));
    }

    movePiece(board, dstPosition) {
        const { board, src } = this.state;
        this.setState({
            board: board.makeMove(src, dstPosition),
            src,
            dstPosition
        });
        // TODO: Is this the correct way to do it? To set state via render method or
        // is the correct way to do it to setState THEN call render?
        // TODO: What is the appropriate way to re-render the component?
        // TODO: Should it be provided to us via props?
        // TODO: Should we be using props for the board or should it be in the state?
        //  - Props are supposed to be passed in by an external entity, not created by
        //    the component itself (I think).
        //  - State is supposed to be 'transient' state that does not need to be re-sent
        //    to the server.
    }

    render({ }, { board, src, dst }) {
        const onPieceClick = (pos) => this.clickPiece(pos);
        return html`<table>
        ${
            board.getRows().map(row => {
                return html`
                    <${RowUi}
                        onPieceClick=${(pos) => onPieceClick(pos)}
                        markedSrc=${src}
                        markedDst=${dst}
                    />
                `;
            });
        }
        </table>
        `;
    }
}

