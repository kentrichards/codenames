import express from 'express'
import { createRoom, getRoom, broadcast, removePlayer, applyAction, renderTemplate, getPlayerIndex } from './room.js'

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
        const players = room.players
        const gameState = room.gameState
        const cards = room.gameState.cards
        res.render('room', { roomCode, username, players, gameState, cards })

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
            room.idleTime = 0
            const result = applyAction(room, ws, username, action)
            if (result) {
                broadcast(room, result.type, result.payload)
            }
        })

        ws.on('close', () => {
            room.idleTime = 0
            removePlayer(room, ws)
            const html = renderTemplate('playersTemplate', { players: room.players })
            broadcast(room, 'userDisconnected', {html: html, player: username})
        })
    })

    return router
}
