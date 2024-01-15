import express from 'express'
import { createRoom, getRoom, broadcast, removePlayer, addPlayer } from './room.js'

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
        const cards = room.gameState.cards
        res.render('room', { roomCode, username, cards, players })
    })

    router.ws('/:roomCode', (ws, req) => {
        const roomCode = req.params.roomCode
        const username = req.cookies.username
        const room = getRoom(roomCode)

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)

            room.gameState.idleTime = 0

            if (action.type === 'userConnected') {
                addPlayer(room, username, ws)
                req.app.render('playersTemplate', { players: room.players }, (err, html) => {
                    if (err) {
                        console.error('Error rendering "players" template:', err)
                        return
                    }
                    broadcast(room, 'userConnected', html)
                })
            } else if (action.type === 'cardClicked') {
                const card = room.gameState.cards.find(card => card.agent === action.payload)
                card.revealed = true
                broadcast(room, 'revealCard', { agent: card.agent, cardType: card.cardType })
            } else {
                console.error(`Unknown message received: ${msg}`)
            }
        })

        ws.on('close', () => {
            room.gameState.idleTime = 0
            removePlayer(room, ws)
            req.app.render('playersTemplate', { players: room.players }, (err, html) => {
                if (err) {
                    console.error('Error rendering "players" template:', err)
                    return
                }
                broadcast(room, 'userDisconnected', html)
            })
        })
    })

    return router
}
