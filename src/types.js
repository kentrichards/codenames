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
 * @property {Boolean} inProgress
 * @property {NodeJS.Timeout | null} idleTimer
 * @property {Card[]} cards
 * @property {number} idleTime
 */

/**
 * @typedef {Object} Card
 * @property {string} agent
 * @property {Role} role
 * @property {boolean} revealed
 */

/**
 * @typedef {'red' | 'blue' | 'neutral' | 'assassin'} Role
 */
