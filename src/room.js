export const activeRooms = []

export function createRoom() {
    return {
        roomCode: generateRoomCode(),
        players: [],
        gameState: {},
    }
}

export function closeRoom(roomIndex) {
    activeRooms.splice(roomIndex, 1)
}

export function getRoom(/** @type {String} */ roomCode) {
    return activeRooms.find(room => room.roomCode === roomCode)
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
