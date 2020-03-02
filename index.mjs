
import { h, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import {BoardUi} from './ui/board.mjs';

// Initialize htm with Preact
const html = htm.bind(h);

// NOTE: When we start receiving board updates from the server, we will have to
// pass back & forth the board's state, therefore it'll be props, not state.
const app = html`<${BoardUi} />`;
render(app, document.getElementById('power'));
