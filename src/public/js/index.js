const roomCodeInput = /** @type {HTMLInputElement} */ (document.getElementById('room-code'))
const joinGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('join-game'))
const aboutGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('about-game'))

roomCodeInput.addEventListener('input', () => {
    roomCodeInput.value = roomCodeInput.value.toUpperCase()
})

roomCodeInput.addEventListener('keydown', (/** @type {KeyboardEvent} */ ev) => {
    if (ev.key === 'Enter') {
        joinGameBtn.click()
    }
})

joinGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()

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

aboutGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()
    window.location.href = '/about'
})
