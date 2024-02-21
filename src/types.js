/**
 * @typedef {Object} Room
 * @property {string} roomCode
 * @property {Player[]} players
 * @property {GameState} gameState
 * @property {Team} playsFirst
 * @property {NodeJS.Timeout | null} idleTimer
 * @property {number} idleTime
 */

/**
 * @typedef {Object} Player
 * @property {string} username
 * @property {Team} team
 * @property {Role} role
 * @property {import('ws')} socket
 */

/**
 * @typedef {Object} GameState
 * @property {Boolean} inProgress
 * @property {GameMode} gameMode
 * @property {Card[]} cards
 * @property {Team} turn
 * @property {'playing' | 'gameOver'} state
 * @property {number} redScore
 * @property {number} blueScore
 */

/**
 * @typedef {Object} Card
 * @property {string} agent
 * @property {CardType} cardType
 * @property {boolean} revealed
 */

/**
 * @typedef {'red' | 'blue' | ''} Team
 */

/**
 * @typedef {'operative' | 'spymaster' | ''} Role
 */

/**
 * @typedef {'red' | 'blue' | 'neutral' | 'assassin'} CardType
 */

/**
 * @typedef {'default' | 'duet' | 'undercover'} GameMode
 */

/**
 * @typedef {Object} Action
 * @property {string} type
 * @property {any} payload
 */
