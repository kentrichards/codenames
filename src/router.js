import express from 'express'
import { createRoom, getRoom, broadcast, removePlayer } from './room.js'

const router = express.Router()

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        res.render('index')
    })

    router.get('/createGame', (req, res) => {
        const roomCode = createRoom()
        res.redirect(`/${roomCode}`)
    })

    router.get('/joinRoom/:roomCode', (req, res) => {
        const roomCode = req.params.roomCode
        if (!getRoom(roomCode)) {
            // TODO: Display error message to user
            res.sendStatus(404)
            return
        }
        res.redirect(`/${roomCode}`)
    })

    router.get('/:roomCode', (req, res) => {
        const roomCode = req.params.roomCode
        const room = getRoom(roomCode)
        if (!room) {
            res.status(404).render('404', { path: req.path })
            return
        }
        const username = req.cookies.username
        const cards = room.gameState.cards
        const inProgress = room.gameState.inProgress
        res.render('room', { roomCode, username, cards, inProgress })

        // TODO: Need to ensure user has a username
        // E.g. if someone clicks a link their friend sent them,
        // they will hit this endpoint where the code assumes they
        // have already set a username for themselves. Players may
        // need to be able to set names for themselves in room.pug
        // for cases when players are not entering thru index.pug
    })

    router.ws('/:roomCode', (ws, req) => {
        const roomCode = req.params.roomCode
        const username = req.cookies.username
        const room = getRoom(roomCode)

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)

            room.gameState.idleTime = 0

            if (action.type === 'userConnected') {
                const newPlayer = {
                    username,
                    team: '',
                    role: '',
                    socket: ws,
                }

                room.players.push(newPlayer)

                broadcast(room, 'message', `User ${username} joined room ${roomCode}`)
                broadcast(room, 'playerJoin', newPlayer)
            } else if (action.type === 'cardClicked') {
                const card = room.gameState.cards.find(card => card.agent === action.payload)
                card.revealed = true
                broadcast(room, 'revealCard', { agent: card.agent, role: card.role })
            } else if (action.type === 'startGame') {
                room.gameState.inProgress = true
                broadcast(room, 'startGame', null)
            } else {
                console.error(`Unknown message received: ${msg}`)
            }
        })

        ws.on('close', () => {
            room.gameState.idleTime = 0
            broadcast(room, 'message', `User ${username} left the room`)
            removePlayer(room, ws)
        })
    })

    return router
}
