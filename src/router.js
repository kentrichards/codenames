import express from 'express'
import { generateRoomCode } from './room.js'
import { getRoom } from './room.js'

const router = express.Router()

const activeRooms = []

function broadcast(room, msg) {
    room.players.forEach(ws => {
        ws.send(msg)
    })
}

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        res.render('index')
    })

    router.get('/createGame', (req, res) => {
        const username = req.query.username
        const newRoomCode = generateRoomCode()
        const newRoom = {
            roomCode: newRoomCode,
            players: [],
            gameState: {},
        }
        activeRooms.push(newRoom)
        res.cookie('username', username)
        res.cookie('SameSite', 'Strict')
        res.redirect(`/${newRoomCode}`)
    })

    router.get('/:roomCode', (req, res) => {
        const roomCode = req.params.roomCode
        const username = req.cookies.username
        res.render('room', { roomCode, username })
    })

    router.ws('/:roomCode', (ws, req) => {
        const roomCode = req.params.roomCode
        const room = getRoom(activeRooms, roomCode)
        const username = req.cookies.username

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)

            if (!action.type) {
                console.error(`Bad message received: ${msg}`)
                return
            }

            if (action.type === 'userConnected') {
                room.players.push(ws)
                broadcast(room, `User ${username} joined room ${roomCode}`)
            } else if (action.type === 'messageReceived') {
                broadcast(room, `${username}: ${action.payload}`)
            } else {
                console.error(`Unknown message received: ${msg}`)
            }

            console.log(activeRooms)
        })
    })

    return router
}
