import path from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new Server(server)
const port = process.env.port || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const activeRooms = []

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(logger('dev'))

app.get('/', (req, res) => {
    res.render('index')
})

io.on('connection', socket => {
    socket.join('main')
    console.log('a user connected to main')

    socket.on('createRoom', roomCode => {
        const newRoom = {
            roomCode: roomCode,
            players: [],
            gameState: {},
        }
        activeRooms.push(newRoom)

        socket.join(roomCode)
        socket.leave('main')
        console.log(socket.rooms)
    })

    socket.on('joinRoom', roomCode => {
        // Also have to:
        // add player to players list of appropriate room
        // check that room exists
        socket.join(roomCode)
        socket.leave('main')

        console.log(socket.rooms)
    })

    socket.on('showGames', () => {
        // Show all rooms
        const rooms = io.of('/').adapter.rooms
        console.log(rooms)
        io.emit('rooms', rooms)
    })
    
    socket.on('msgRm', room => {
        io.to(room).emit('rmMsg', `Hello to room ${room}`)
    })

    socket.on('disconnect', reason => {
        console.log(`a user disconnected because of ${reason}`)
    })
})

server.listen(port, () => {
    console.log('server running at http://localhost:3000')
})
