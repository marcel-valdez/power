// jshint esversion: 6

import {html, render} from './ui/renderer.mjs';
import {BoardUi} from './ui/board.mjs';
import utils from './core/utils.mjs';


utils.disableLogging();

// NOTE: When we start receiving board updates from the server, we will have
// to pass back & forth the board's state, therefore it'll be props, not
// state.
const app = html`<${BoardUi} />`;
render(app, document.getElementById('power'));
