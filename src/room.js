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
            redirectPlayer(player, '/')
        })
    }
    const roomIndex = activeRooms.indexOf(room)
    activeRooms.splice(roomIndex, 1)
}

export function removePlayer(room, socket) {
    const playerIndex = room.players.indexOf(socket)
    room.players.splice(playerIndex, 1)
}

export function getRoom(/** @type {String} */ roomCode) {
    return activeRooms.find(room => room.roomCode === roomCode)
}

export function redirectPlayer(socket, path) {
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
        player.send(JSON.stringify({ type: 'message', payload: msg }))
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
