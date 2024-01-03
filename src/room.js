export const activeRooms = []

export function createRoom() {
    return {
        roomCode: generateRoomCode(),
        players: [],
        gameState: {},
    }
}

export function closeRoom(room) {
    if (room.players.length > 0) {
        room.players.forEach(player => {
            redirectSocket(player.socket, '/')
        })
    }
    const roomIndex = activeRooms.indexOf(room)
    activeRooms.splice(roomIndex, 1)
}

export function removePlayer(room, socket) {
    for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].socket == socket) {
            room.players.splice(i, 1)
            return
        }
    }
}

export function getRoom(/** @type {String} */ roomCode) {
    return activeRooms.find(room => room.roomCode === roomCode)
}

export function redirectSocket(socket, path) {
    const redirect = { type: 'redirect', payload: `${path}` }
    socket.send(JSON.stringify(redirect))
}

export function idleTimeout(room, idleTime) {
    idleTime.timer += 1
    if (idleTime.timer > 9) {
        closeRoom(room)
    }
}

export function broadcast(room, msg) {
    room.players.forEach(player => {
        player.socket.send(JSON.stringify({ type: 'message', payload: msg }))
    })
}

function generateRoomCode() {
    const alphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
    ]

    return (
        alphabet[Math.floor(Math.random() * alphabet.length)] +
        alphabet[Math.floor(Math.random() * alphabet.length)] +
        alphabet[Math.floor(Math.random() * alphabet.length)] +
        alphabet[Math.floor(Math.random() * alphabet.length)]
    )
}
