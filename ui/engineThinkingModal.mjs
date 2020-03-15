import {html, Component} from '../ui/renderer.mjs';

export class EngineThinkingModal extends Component {
  render({ }, { }) {
    return html`<div class='modal thinking'>
Mmmhhh... let me think<br/>
<img src="ui/thinking.gif" width="40" height="40"></img>
</div>`;
  }
}
