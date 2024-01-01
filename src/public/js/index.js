const usernameInput = /** @type {HTMLInputElement} */ (document.getElementById('username'))
const createGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('create-game'))
const roomCodeInput = /** @type {HTMLInputElement} */ (document.getElementById('room-code'))
const joinGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('join-game'))

createGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()

    const username = usernameInput.value
    if (!username) {
        console.error('Username required to create game')
        return
    }

    fetch(`/createGame/${encodeURIComponent(username)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`${res.status} ${res.statusText}`)
            } else if (res.redirected) {
                window.location.href = res.url
            }
        })
        .catch(err => {
            console.error(`Error creating game: ${err.message}`)
        })
})

roomCodeInput.addEventListener('input', () => {
    roomCodeInput.value = roomCodeInput.value.toUpperCase()
})

joinGameBtn.addEventListener('click', (/** @type {MouseEvent}*/ ev) => {
    ev.preventDefault()

    const username = usernameInput.value
    if (!username) {
        console.error('Username required to join game')
        return
    }

    const roomCode = roomCodeInput.value
    if (!roomCode) {
        console.error('Room code required to join game')
        return
    }

    if (roomCode.length !== 4) {
        console.error('Room code must be 4 characters long')
        return
    }

    fetch(`/joinRoom/${roomCode}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`${res.status} ${res.statusText}`)
            } else if (res.redirected) {
                window.location.href = res.url
            }
        })
        .catch(err => {
            console.error(`Error joining game: ${err.message}`)
        })
})
