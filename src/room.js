export const activeRooms = []

export function createRoom() {
    return {
        roomCode: generateRoomCode(),
        players: [],
        gameState: {},
    }
}

export function getRoom(/** @type {String} */ roomCode) {
    for (let i = 0; i < activeRooms.length; i++) {
        if (activeRooms[i].roomCode === roomCode) {
            return activeRooms[i]
        }
    }
}

export function broadcast(room, msg) {
    room.players.forEach(ws => {
        ws.send(msg)
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
