function generateRoomCode() {
    // todo make better
    return Math.floor(Math.random() * 1000).toString()
}

export { generateRoomCode }
