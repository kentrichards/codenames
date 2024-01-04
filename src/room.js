export const activeRooms = []

/**
 * @returns {Room}
 */
export function createRoom() {
    return {
        roomCode: generateRoomCode(),
        players: [],
        gameState: {
            idleTimer: null,
            idleTime: 0,
        },
    }
}

export function closeRoom(room) {
    room.players.forEach(player => redirectSocket(player.socket, '/'))
    clearInterval(room.gameState.idleTimer)
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

/**
 *
 * @param {string} roomCode
 * @returns {Room | undefined}
 */
export function getRoom(/** @type {String} */ roomCode) {
    return activeRooms.find(room => room.roomCode === roomCode)
}

export function redirectSocket(socket, path) {
    const redirect = { type: 'redirect', payload: path }
    socket.send(JSON.stringify(redirect))
}

export function idleTimeout(room) {
    room.gameState.idleTime += 1

    if (room.players.length < 1 && room.gameState.idleTime > 1) {
        closeRoom(room)
    } else if (room.gameState.idleTime > 9) {
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
