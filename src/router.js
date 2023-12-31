import express from 'express'
import { generateRoomCode } from './room.js'

const router = express.Router()

// eslint-disable-next-line no-unused-vars
export default expressWsInstance => {
    router.get('/', (req, res) => {
        res.render('index')
    })

    router.get('/createGame', (req, res) => {
        res.redirect(`/${generateRoomCode()}`)
    })

    router.get('/:roomCode', (req, res) => {
        // const username = req.cookies.username
        const roomCode = req.params.roomCode

        res.render('room', { roomCode })
    })

    router.ws('/:roomCode', (ws, req) => {
        const roomCode = req.params.roomCode

        ws.on('message', msg => {
            ws.send(`Echo: ${msg}`)
            console.log(`/${roomCode}: ${msg}`)
        })
    })

    return router
}
