import express from 'express'
import { createRoom, getRoom, broadcast, removePlayer, applyAction, renderTemplate } from './room.js'

const router = express.Router()

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        res.render('index')
    })

    router.get('/createGame', (req, res) => {
        const mode = req.query.mode
        const roomCode = createRoom(mode)
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
        const players = room.players
        const turn = room.gameState.turn
        res.render('room', { roomCode, username, cards, players, turn })
    })

    router.ws('/:roomCode', (ws, req) => {
        const roomCode = req.params.roomCode
        const username = req.cookies.username
        const room = getRoom(roomCode)

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)
            room.gameState.idleTime = 0
            const result = applyAction(room, ws, username, action)
            if (result) {
                broadcast(room, result.type, result.payload)
            }
        })

        ws.on('close', () => {
            room.gameState.idleTime = 0
            removePlayer(room, ws)
            const html = renderTemplate('playersTemplate', { players: room.players })
            broadcast(room, 'userDisconnected', html)
        })
    })

    return router
}
