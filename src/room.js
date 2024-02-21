import path from 'path'
import { fileURLToPath } from 'url'
import { renderFile } from 'pug'
import { newGameState } from './game.js'

const activeRooms = []

/**
 *
 * @param {import('ws')} ws
 * @param {Room} room
 * @param {string} username
 * @param {Action} action
 * @returns {Action | undefined}
 */
export function applyAction(room, ws, username, action) {
    const { type, payload } = action

    if (type === 'newGame') {
        room.playsFirst = room.playsFirst === 'red' ? 'blue' : 'red'
        room.gameState = newGameState(room.playsFirst, room.gameState.gameMode)
        const newBoard = renderTemplate('boardTemplate', { cards: room.gameState.cards })
        const scoreMsg = renderTemplate('scoreTemplate', {
            redScore: room.gameState.redScore,
            blueScore: room.gameState.blueScore,
        })
        return {
            type: 'newGame',
            payload: {
                newBoard,
                scoreMsg,
                turnMsg: room.gameState.turn === 'red' ? "Red's Turn" : "Blue's Turn",
            },
        }
    }

    if (type === 'userConnected') {
        addPlayer(room, username, ws)
        const htmlSelf = renderTemplate('lobbySelf', {username})
        const html = renderTemplate('lobbyPlayer', {username})
        return { type: 'userConnected', payload: { player: username, self: htmlSelf, html } }
    }

    if (type === 'playerUpdate') {
        const player = room.players[getPlayerIndex(room, ws)]

        if (payload.updateType === 'role') {
            player.role = payload.updateValue
        } else if (payload.updateType === 'team') {
            player.team = payload.updateValue
        }

        return {
            type: 'playerUpdate',
            payload: { player: player.username, updateType: payload.updateType, updateValue: payload.updateValue },
        }
    }

    if (type === 'startGame') {
        const html = renderTemplate('playersTemplate', { players: room.players })
        return { type: 'startGame', payload: {html}}
    }

    if (type === 'cardClicked') {
        if (!isPlayersTurn(room, ws)) return
        if (room.gameState.state === 'gameOver') return
        const team = room.players.find(player => player.username === username).team
        const card = room.gameState.cards.find(card => card.agent === payload)
        card.revealed = true

        if (card.cardType === 'red') {
            room.gameState.redScore--
        } else if (card.cardType === 'blue') {
            room.gameState.blueScore--
        }

        const scoreMsg = renderTemplate('scoreTemplate', {
            redScore: room.gameState.redScore,
            blueScore: room.gameState.blueScore,
        })

        if (card.cardType === 'assassin') {
            room.gameState.state = 'gameOver'
            return {
                type: 'gameOver',
                payload: {
                    agent: card.agent,
                    cardType: card.cardType,
                    scoreMsg,
                    winner: room.gameState.turn === 'red' ? 'blue' : 'red',
                    winnerMsg: room.gameState.turn === 'red' ? 'Blue Team Wins!' : 'Red Team Wins!',
                },
            }
        }

        if (room.gameState.redScore === 0) {
            room.gameState.state = 'gameOver'
            return {
                type: 'gameOver',
                payload: {
                    agent: card.agent,
                    cardType: card.cardType,
                    winnerMsg: 'Red Team Wins!',
                    scoreMsg,
                },
            }
        }

        if (room.gameState.blueScore === 0) {
            room.gameState.state = 'gameOver'
            return {
                type: 'gameOver',
                payload: {
                    agent: card.agent,
                    cardType: card.cardType,
                    winnerMsg: 'Blue Team Wins!',
                    scoreMsg,
                },
            }
        }

        if (team !== card.cardType) {
            room.gameState.turn = room.gameState.turn === 'red' ? 'blue' : 'red'
            return {
                type: 'endTurnForced',
                payload: {
                    agent: card.agent,
                    cardType: card.cardType,
                    scoreMsg,
                    newTurnMsg: team === 'red' ? "Blue's Turn" : "Red's Turn",
                },
            }
        }

        return {
            type: 'revealCard',
            payload: {
                agent: card.agent,
                cardType: card.cardType,
                scoreMsg,
            },
        }
    }

    if (type === 'endTurnClicked') {
        if (!isPlayersTurn(room, ws)) return
        if (room.gameState.state === 'gameOver') return
        room.gameState.turn = room.gameState.turn === 'red' ? 'blue' : 'red'
        const msg = room.gameState.turn === 'red' ? "Red's Turn" : "Blue's Turn"
        return { type: 'endTurnClicked', payload: msg }
    }

    console.error(`Unknown message received: ${action}`)
    return undefined
}

/**
 * @param {Room} room the current room, which we use to determine which team's turn it is
 * @param {import('ws')} ws the WebSocket that initiated the action
 * @returns true when it is the player's turn, false otherwise
 */
function isPlayersTurn(room, ws) {
    const player = room.players.find(p => p.socket === ws)
    return player.team === room.gameState.turn
}

/**
 * Renders the file `templateName`, using the given `locals` object, to an html string
 * @param {string} templateName the name of the template file, excluding the file extension
 * @param {Object} locals a Pug locals object
 * @returns the html string, which can be sent to the client
 */
export function renderTemplate(templateName, locals) {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const viewsDir = path.join(__dirname, 'views')
    const filePath = path.join(viewsDir, `${templateName}.pug`)
    return renderFile(filePath, locals)
}

/**
 * @returns {string} the roomCode of the newly created room
 */
export function createRoom(gameMode) {
    const playsFirst = 'red'
    const newRoom = {
        roomCode: generateRoomCode(),
        gameState: newGameState(playsFirst, gameMode),
        players: [],
        playsFirst,
        idleTime: 0,
    }
    newRoom.idleTimer = setInterval(idleTimeout, 60000, newRoom)
    activeRooms.push(newRoom)
    return newRoom.roomCode
}

export function closeRoom(room) {
    room.players.forEach(player => redirectSocket(player.socket, '/'))
    clearInterval(room.idleTimer)
    const roomIndex = activeRooms.indexOf(room)
    activeRooms.splice(roomIndex, 1)
}

/**
 *
 * @param {Room} room
 * @param {string} username
 * @param {import('ws')} socket
 */
export function addPlayer(room, username, socket) {
    room.players.push({
        username,
        team: '',
        role: '',
        socket,
    })
}

export function getPlayerIndex(room, socket) {
    for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].socket == socket) {
            return i
        }
    }

    return -1
}

export function removePlayer(room, socket) {
    for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].socket === socket) {
            room.players.splice(i, 1)
            return
        }
    }
}

/**
 *
 * @param {string} roomCode
 * @returns {Room | undefined}
 */
export function getRoom(/** @type {String} */ roomCode) {
    return activeRooms.find(room => room.roomCode === roomCode)
}

export function redirectSocket(socket, path) {
    const redirect = { type: 'redirect', payload: path }
    socket.send(JSON.stringify(redirect))
}

/**
 *
 * @param {Room} room
 * @param {string} type
 * @param {any} payload
 */
export function broadcast(room, type, payload) {
    room.players.forEach(player => {
        player.socket.send(JSON.stringify({ type, payload }))
    })
}

function idleTimeout(room) {
    room.idleTime += 1

    if (room.players.length < 1 && room.idleTime > 1) {
        closeRoom(room)
    } else if (room.idleTime > 9) {
        closeRoom(room)
    }
}

function generateRoomCode() {
    const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
    ]

    return (
        alphabet[Math.floor(Math.random() * alphabet.length)] +
        alphabet[Math.floor(Math.random() * alphabet.length)] +
        alphabet[Math.floor(Math.random() * alphabet.length)] +
        alphabet[Math.floor(Math.random() * alphabet.length)]
    )
}

/**
 * Determines which team has fewer players, defaulting to 'red' when even
 * @param {Player[]} players
 * @returns {Team} the team with the fewest players
 */
function teamWithLessPlayers(players) {
    let numRed = 0
    let numBlue = 0
    players.forEach(player => {
        if (player.team === 'red') numRed++
        else numBlue++
    })
    return numRed > numBlue ? 'blue' : 'red'
}
