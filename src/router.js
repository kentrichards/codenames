import express from 'express'

import { generateRoomCode } from './util.js'

const activeRooms = []

const router = express.Router()

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/createGame', (req, res) => {
    const newRoom = {
        roomCode: generateRoomCode(),
        players: [],
        gameState: {},
    }

    activeRooms.push(newRoom)

    res.redirect(`/${newRoom.roomCode}`)
})

router.get('/:roomCode', (req, res) => {
    const username = req.cookies.username
    const roomCode = req.params.roomCode

    // unsure about session tracking — how do we keep track of players?
    // probably want more than just their name, an id too?
    for (let room of activeRooms) {
        if (room.roomCode === roomCode) {
            if (room.players.includes(username)) break
            room.players = [username, ...room.players]
        }
    }

    console.log(activeRooms)
    res.send(`user ${username} joined room ${roomCode}`)
})

export default router
