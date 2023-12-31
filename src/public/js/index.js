const usernameInput = /** @type {HTMLInputElement} */ (document.getElementById('username'))
const createGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('create-game'))
// const roomCodeInput = /** @type {HTMLInputElement} */ (document.getElementById('room-code'))
// const joinGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('join-game'))

createGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()

    const username = usernameInput.value
    if (!username) {
        console.error('Username required to create game')
        return
    }

    fetch(`/createGame?username=${encodeURIComponent(username)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`status=${res.status}`)
            } else if (res.redirected) {
                window.location.href = res.url
            }
        })
        .catch(err => {
            console.error(`Error creating game: ${err}`)
        })
})
