import express from 'express'
import { generateRoomCode } from './room.js'

const router = express.Router()

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        res.render('index')
    })

    router.get('/createGame', (req, res) => {
        const username = req.query.username
        res.cookie('username', username)
        res.cookie('SameSite', 'Strict')
        res.redirect(`/${generateRoomCode()}`)
    })

    router.get('/:roomCode', (req, res) => {
        const roomCode = req.params.roomCode
        const username = req.cookies.username
        res.render('room', { roomCode, username })
    })

    router.ws('/:roomCode', (ws, req) => {
        const roomCode = req.params.roomCode
        const username = req.cookies.username

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)

            if (!action.type) {
                console.error(`Bad message received: ${msg}`)
                return
            }

            if (action.type === 'userConnected') {
                ws.send(`User ${username} joined room ${roomCode}`)
            } else if (action.type === 'messageReceived') {
                ws.send(`${username}: ${action.payload}`)
            } else {
                console.error(`Unknown message received: ${msg}`)
            }
        })
    })

    return router
}
