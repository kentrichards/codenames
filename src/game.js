import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const agents = {
    /** @type {string[]} */ default: [],
    /** @type {string[]} */ duet: [],
    /** @type {string[]} */ undercover: [],
}

function loadAgents() {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const dataDir = path.join(__dirname, 'data')

    try {
        const files = fs.readdirSync(dataDir)
        files.forEach(file => {
            const contents = fs.readFileSync(path.join(dataDir, file))
            agents[file] = contents.toString().split('\n')
        })
    } catch (err) {
        console.error('Error reading agent data:', err)
        process.exit(1)
    }
}

/**
 * Draw 25 agents of the type given by gameMode
 * @param {'default' | 'duet' | 'undercover'} gameMode
 */
export function drawAgents(gameMode = 'default') {
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

    if (agents[gameMode].length === 0) {
        loadAgents()
    }

    shuffle(agents[gameMode])
    const NUM_AGENTS_PER_DRAW = 25
    return agents[gameMode].slice(0, NUM_AGENTS_PER_DRAW)
}
