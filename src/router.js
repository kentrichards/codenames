import express from 'express'
import {
    activeRooms,
    createRoom,
    closeRoom,
    getRoom,
    broadcast,
    redirectSocket,
    removePlayer,
    idleTimeout,
} from './room.js'

const router = express.Router()

const idleTime = { timer: 0 }
let emptyRoomTimeout = null
let idleTimer = null

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        if (idleTimer != null) {
            clearInterval(idleTimer)
        }
        res.render('index')
    })

    router.get('/createGame/:username', (req, res) => {
        const username = req.params.username
        res.cookie('username', username, { sameSite: 'strict' })
        const newRoom = createRoom()
        activeRooms.push(newRoom)
        idleTimer = setInterval(idleTimeout, 60000, newRoom, idleTime)
        res.redirect(`/${newRoom.roomCode}`)
    })

    router.get('/joinRoom/:roomCode/:username', (req, res) => {
        const roomCode = req.params.roomCode
        if (!getRoom(roomCode)) {
            // TODO: redirect to homepage/room not found page
            res.sendStatus(404)
            return
        }
        const username = req.params.username
        res.cookie('username', username, { sameSite: 'strict' })
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

        if (!room) {
            redirectSocket(ws, '/')
            return
        }

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)

            if (!action.type) {
                console.error(`Bad message received: ${msg}`)
                return
            }

            idleTime.timer = 0

            if (action.type === 'userConnected') {
                const newPlayer = {
                    username: `${username}`,
                    team: '',
                    role: '',
                    socket: ws,
                }

                room.players.push(newPlayer)

                if (emptyRoomTimeout != null) {
                    clearTimeout(emptyRoomTimeout)
                }

                broadcast(room, `User ${username} joined room ${roomCode}`)
            } else if (action.type === 'messageReceived') {
                broadcast(room, `${username}: ${action.payload}`)
            } else {
                console.error(`Unknown message received: ${msg}`)
            }
        })

        ws.on('close', () => {
            broadcast(room, `User ${username} left the room`)
            removePlayer(room, ws)
            if (room.players.length < 1) {
                emptyRoomTimeout = setInterval(closeRoom, 120000, room)
            }
        })
    })

    return router
}
