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

    router.get('/createGame', (req, res) => {
        const newRoom = createRoom()
        activeRooms.push(newRoom)
        idleTimer = setInterval(idleTimeout, 60000, newRoom, idleTime)
        res.redirect(`/${newRoom.roomCode}`)
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

        // Is this necessary when we already check if the room exists in .get('/:roomCode')?
        // Wondering if there is a race condition we need to worry about w.r.t timers closing rooms
        if (!room) {
            redirectSocket(ws, '/')
            return
        }

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)

            // This is not strictly necessary, the below if-else chain will catch this case without issue
            // If !action.type, action.type === undefined, so we will be comparing undefined to strings below
            // and will hit the else clause (which prints a similar error message)
            // We only run into problems if we try to access a property on another, undefined, property
            // E.g. accessing action.type.other without checking if action.type exists
            if (!action.type) {
                console.error(`Bad message received: ${msg}`)
                return
            }

            idleTime.timer = 0

            if (action.type === 'userConnected') {
                const newPlayer = {
                    username,
                    team: '',
                    role: '',
                    socket: ws,
                }

                room.players.push(newPlayer)

                if (emptyRoomTimeout != null) {
                    // clearTimeout is a Node function — should this be clearInterval?
                    clearTimeout(emptyRoomTimeout)
                }

                broadcast(room, `User ${username} joined room ${roomCode}`)
            } else if (action.type === 'message') {
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
