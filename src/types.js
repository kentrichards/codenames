/**
 * @typedef {Object} Room
 * @property {string} roomCode
 * @property {Player[]} players
 * @property {GameState} gameState
 */

/**
 * @typedef {Object} Player
 * @property {string} username
 * @property {string} team
 * @property {string} role
 * @property {import('ws')} socket
 */

/**
 * @typedef {Object} GameState
 * @property {NodeJS.Timeout | null} idleTimer
 * @property {Map<string, string>} cards
 * @property {number} idleTime
 */
