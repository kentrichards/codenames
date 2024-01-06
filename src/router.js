import express from 'express'
import { createRoom, getRoom, broadcast, removePlayer } from './room.js'
import { drawAgents } from './game.js'

const router = express.Router()

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        res.render('index')
    })

    router.get('/board', (req, res) => {
        const agents = drawAgents()
        res.render('board', { agents })
    })

    router.get('/createGame', (req, res) => {
        const roomCode = createRoom()
        res.redirect(`/${roomCode}`)
    })

    router.get('/joinRoom/:roomCode', (req, res) => {
        const roomCode = req.params.roomCode
        if (!getRoom(roomCode)) {
            // TODO: redirect to homepage/room not found page
            res.sendStatus(404)
            return
        }
        res.redirect(`/${roomCode}`)
    })

    router.get('/:roomCode', (req, res) => {
        const roomCode = req.params.roomCode
        if (!getRoom(roomCode)) {
            // TODO: redirect to homepage/room not found page
            res.sendStatus(404)
            return
        }
        const username = req.cookies.username
        res.render('room', { roomCode, username })

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

                broadcast(room, `User ${username} joined room ${roomCode}`)
            } else if (action.type === 'message') {
                broadcast(room, `${username}: ${action.payload}`)
            } else {
                console.error(`Unknown message received: ${msg}`)
            }
        })

        ws.on('close', () => {
            room.gameState.idleTime = 0
            broadcast(room, `User ${username} left the room`)
            removePlayer(room, ws)
        })
    })

    return router
}
