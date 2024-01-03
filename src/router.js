import express from 'express'
import { activeRooms, createRoom, closeRoom, getRoom, broadcast } from './room.js'

const router = express.Router()
let roomTimeout = null

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        res.render('index')
    })

    router.get('/createGame/:username', (req, res) => {
        const username = req.params.username
        res.cookie('username', username, { sameSite: 'strict' })
        const newRoom = createRoom()
        activeRooms.push(newRoom)
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

        if(!room) {
            const redirect = { type: 'redirect', payload: '/' }
            ws.send(JSON.stringify(redirect))
            return
        }

        ws.on('message', (/** @type {String} */ msg) => {
            const action = JSON.parse(msg)

            if (!action.type) {
                console.error(`Bad message received: ${msg}`)
                return
            }

            if (action.type === 'userConnected') {
                room.players.push(ws)

                if (roomTimeout != null) {
                    clearTimeout(roomTimeout)
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

            const playerIndex = room.players.indexOf(ws)
            if (playerIndex > -1) {
                room.players.splice(playerIndex, 1)
            }

            const roomIndex = activeRooms.indexOf(room)
            if (room.players.length < 1 && roomIndex > -1) {
                roomTimeout = setInterval(closeRoom, 120000, roomIndex)
            }
        })
    })

    return router
}