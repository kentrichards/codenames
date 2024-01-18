/**
 * @typedef {Object} Room
 * @property {string} roomCode
 * @property {Player[]} players
 * @property {GameState} gameState
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
 * @property {NodeJS.Timeout | null} idleTimer
 * @property {GameMode} gameMode
 * @property {Card[]} cards
 * @property {number} idleTime
 * @property {Team} turn
 */

/**
 * @typedef {Object} Card
 * @property {string} agent
 * @property {CardType} cardType
 * @property {boolean} revealed
 */

/**
 * @typedef {'red' | 'blue'} Team
 */

/**
 * TODO: Come up with better name than 'guesser'
 * @typedef {'guesser' | 'spymaster'} Role
 */

/**
 * @typedef {'red' | 'blue' | 'neutral' | 'assassin'} CardType
 */

/**
 * @typedef {'default' | 'duet' | 'undercover'} GameMode
 */
