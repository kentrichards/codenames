import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const agents = {
    /** @type {string[]} */ default: [],
    /** @type {string[]} */ duet: [],
    /** @type {string[]} */ undercover: [],
}

/**
 * @param {Team} playsFirst the team that will play first
 * @param {GameMode} gameMode determines the set of cards to draw from
 * @returns {GameState} a new game state object, representing a new game
 */
export function newGameState(playsFirst, gameMode) {
    let redScore, blueScore
    if (playsFirst === 'red') {
        redScore = 9
        blueScore = 8
    } else {
        redScore = 8
        blueScore = 9
    }

    return {
        gameMode,
        cards: getCards(playsFirst, gameMode),
        turn: playsFirst,
        state: 'playing',
        redScore,
        blueScore,
    }
}

/**
 * Draw 25 cards of the type given by gameMode
 * @param {Team} playsFirst the team with more cards
 * @param {'default' | 'duet' | 'undercover'} gameMode
 * @returns {Card[]} the 25 card deck, in agent:role pairs
 */
export function getCards(playsFirst = 'red', gameMode = 'default') {
    const types = /** @type {CardType[]} */ ([
        playsFirst,
        'red',
        'red',
        'red',
        'red',
        'red',
        'red',
        'red',
        'red',
        'blue',
        'blue',
        'blue',
        'blue',
        'blue',
        'blue',
        'blue',
        'blue',
        'neutral',
        'neutral',
        'neutral',
        'neutral',
        'neutral',
        'neutral',
        'neutral',
        'assassin',
    ])
    const agents = drawAgents(gameMode)
    shuffle(types)
    const cards = /** @type {Card[]} */ ([])
    agents.forEach((agent, i) => {
        cards.push({ agent, cardType: types[i], revealed: false })
    })
    return cards
}

/**
 * Draw 25 agents of the type given by gameMode
 * @param {'default' | 'duet' | 'undercover'} gameMode
 */
function drawAgents(gameMode) {
    if (agents[gameMode].length === 0) {
        loadAgents()
    }
    shuffle(agents[gameMode])
    const NUM_AGENTS_PER_DRAW = 25
    return agents[gameMode].slice(0, NUM_AGENTS_PER_DRAW)
}

function loadAgents() {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const dataDir = path.join(__dirname, 'data')

    try {
        const files = fs.readdirSync(dataDir)
        files.forEach(file => {
            const contents = fs.readFileSync(path.join(dataDir, file))
            agents[file] = contents.toString().split(/\r?\n/)
        })
    } catch (err) {
        console.error('Error reading agent data:', err)
        process.exit(1)
    }
}

/**
 * Use the Fisher-Yates algorithm to shuffle arr in place
 * @param {any[]} arr
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
}
