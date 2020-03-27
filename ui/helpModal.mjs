// jshint esversion: 6

import {html, Component} from '../ui/renderer.mjs';

export class HelpButton extends Component {
  render({ onClick = () => {} }, { }) {
    return html`
<button
  class='btn'
  type='button'
  title='Show help'
  onClick=${onClick}>?</button>`;
  }
}


export class HelpModal extends Component {
  render({ onClick = () => {} }, { }) {
    return html`
<div class="modal help-modal" onClick=${onClick}>
  <div class="piece-moves">
    <div class="piece-moves-title">
      <b>Notation</b>
    </div>
    <ul>
      <li><b>M</b>: Piece can move to this square.
        <ul>
          <li>No piece, other than the Knight (♘) can skip pieces.</li>
        </ul>
      </li>
      <li><b>A</b>: Piece can attack or sacrifice on this square.
        <ul>
          <li id="knight-attack">
            <b>♘</b>: It can only attack the marked square <tag class="knight-skip">(MA)</tag> if there is a piece in between to skip.
          </li>
          <li>
            <b>♔</b>: It can't sacrifice.
          </li>
        </ul>
      </li>
    </ul>
  </div>

  <table class="all-pieces-moves">
    <tbody>
      <tr>
        <td>
          <div class="piece-moves">
            <div class="piece-moves-title">King (♔)</div>
            <table class="moves-table">
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>MA</td>
                  <td>MA</td>
                  <td>MA</td>
                  <td></td>
                </tr>

                <tr>
                  <td></td>
                  <td>MA</td>
                  <td>♔</td>
                  <td>MA</td>
                  <td></td>
                </tr>

                <tr>
                  <td></td>
                  <td>MA</td>
                  <td>MA</td>
                  <td>MA</td>
                  <td></td>
                </tr>

                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
            </tbody>
          </table>
        </div>
      </td>
      <td>
        <div class="piece-moves">
          <div class="piece-moves-title">Pawn (♙)</div>
          <table class="moves-table">
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>M</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td>A</td>
                <td>M</td>
                <td>A</td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>♙</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="piece-moves">
          <div class="piece-moves-title">Knight (♘)</div>
          <table class="moves-table">
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
                <td></td>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
                <td></td>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
              </tr>

              <tr>
                <td> </td>
                <td>M</td>
                <td>M</td>
                <td>M</td>
                <td> </td>
              </tr>

              <tr>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
                <td>M</td>
                <td>♘</td>
                <td>M</td>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
              </tr>

              <tr>
                <td></td>
                <td>M</td>
                <td>M</td>
                <td>M</td>
                <td></td>
              </tr>

              <tr>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
                <td></td>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
                <td></td>
                <td class="knight-skip" title="Only legal if there is a piece to skip.">MA</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    <td>
      <div class="piece-moves">
        <div class="piece-moves-title">Rook (♖)</div>
          <table class="moves-table">
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td>MA</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>MA</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>MA</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>MA</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td>MA</td>
                <td>MA</td>
                <td>♖</td>
                <td>MA</td>
                <td>MA</td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>MA</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>MA</td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td></td>
                <td></td>
                <td>MA</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</div>
`;
  }
}
