// jshint esversion: 6


/**
* This is the num to communicate between the Matchmaking client
* and service.
*/
export const MessageType = Object.freeze({
  FIND_MATCH: 'match.find',
  OPPONENT_FOUND: 'match.opponent_found',
  PLAYER_ACTION: 'match.player.action',
  OPPONENT_ACTION: 'match.opponent.action',
  BOARD_UPDATE: 'match.board_update'
});


/**
 * These are the enums used to communicate between the web page
 * and the client worker.
 */
export const ClientAction = {
  CONNECT: "client.connect",
  FIND_MATCH: "client.find_match",
  SEND_MOVE: "client.send_move",
  RESIGN: "client.resign",
  DISCONNECT: "client.disconnect",
};

/**
 * These are the enums used to communicate between the web page
 * and the client worker.
 */
export const ClientEvent = {
  CONNECTED: 'client.connected',
  DISCONNECTED: 'client.connected',
  MATCH_STARTED: 'client.found_match',
  BOARD_UPDATED: 'client.board_update'
};

/**
 * Possible states for the matchmaking client.
 */
export const ClientState = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTED: "CONNECTED",
  FINDING_MATCH: "FINDING_MATCH",
  MATCH_STARTED: "MATCH_STARTED",
  MATCH_ENDED: "MATCH_ENDED"
};
