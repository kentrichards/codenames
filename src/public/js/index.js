const usernameInput = /** @type {HTMLInputElement} */ (document.getElementById('username'))
const createGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('create-game'))
const roomCodeInput = /** @type {HTMLInputElement} */ (document.getElementById('room-code'))
const joinGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('join-game'))
const showGamesBtn = /** @type {HTMLButtonElement} */ (document.getElementById('show-games'))
const msgRmBtn = /** @type {HTMLButtonElement} */ (document.getElementById('msg-rm'))
const infoMsg = /** @type {HTMLParagraphElement} */ (document.getElementById('msg'))
const socket = io()

var myRoom = ''

socket.on('rmMsg', msg => {
    infoMsg.innerText = msg
})

function generateRoomCode() {
    // todo make better
    return Math.floor(Math.random() * 1000).toString()
}

createGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()

    const username = usernameInput.value
    const roomCode = generateRoomCode()
    myRoom = roomCode

    if (!username) {
        console.error('Username required to create game')
        return
    }

    document.cookie = `username=${encodeURIComponent(username)}; SameSite=Strict`
    infoMsg.innerText = 'You are now a part of room ' + roomCode
    socket.emit('createRoom', roomCode)
})

joinGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()

    const username = usernameInput.value
    const roomCode = roomCodeInput.value
    myRoom = roomCode

    if (!username) {
        console.error('Username required to create game')
        return
    }

    document.cookie = `username=${encodeURIComponent(username)}; SameSite=Strict`
    infoMsg.innerText = 'You are now a part of room ' + roomCode
    socket.emit('joinRoom', roomCode)
})

// For Testing
showGamesBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()
    socket.emit('showGames')
})

msgRmBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()
    console.log('sending message to room ' + myRoom)
    socket.emit('msgRm', myRoom)
})