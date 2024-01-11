let socket
function openWebSocketConnection() {
    if (!document.cookie.includes('username')) {
        console.error('Username cookie required to open websocket connection')
        return
    }

    socket = new WebSocket('ws://' + window.location.host + window.location.pathname)

    socket.addEventListener('open', () => {
        const action = { type: 'userConnected' }
        socket.send(JSON.stringify(action))
    })

    socket.addEventListener('message', ev => {
        const action = JSON.parse(ev.data)

        if (action.type === 'redirect') {
            window.location.href = action.payload
        } else if (action.type === 'playerJoin') {
            if (lobbyDialogEl) {
                addNewPlayer(action.payload.player)
            }
            console.log(`${action.payload.msg}`)
        } else if (action.type === 'playerLeave') {
            if (lobbyDialogEl) {
                removePlayer(action.payload.playerId)
            }
            console.log(`${action.payload.msg}`)
        } else if (action.type === 'startGame') {
            lobbyDialogEl.close()
        } else if (action.type === 'message') {
            console.log('message received', action.payload)
        } else if (action.type === 'revealCard') {
            const card = cardEls.find(card => card.innerText === action.payload.agent)
            card.className += ` ${action.payload.role}`
        } else {
            console.error(`Unknown message received: ${ev.data}`)
        }
    })
}

const usernameDialogEl = /** @type {HTMLDialogElement} */ (document.getElementById('usernameCheck'))
const usernameInput = /** @type {HTMLInputElement} */ (document.getElementById('username'))
const submitBtn = /** @type {HTMLButtonElement} */ (document.getElementById('submit'))

if (usernameDialogEl && usernameInput && submitBtn) {
    /* Prevent the 'Esc' key from closing the dialog */
    usernameDialogEl.addEventListener('cancel', ev => ev.preventDefault())

    submitBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
        ev.preventDefault()

        const username = usernameInput.value
        if (!username) {
            console.error('Username required to create game')
            return
        }

        document.cookie = `username=${username}; SameSite=Strict`
        usernameDialogEl.close()
        if (lobbyDialogEl) {
            lobbyDialogEl.showModal()
        }
        openWebSocketConnection()
    })
} else {
    // If these elements don't exist, the username dialog must not have been sent by the
    // server, which means a username cookie already exists from a previous session
    openWebSocketConnection()
}

const lobbyDialogEl = /** @type {HTMLDialogElement} */ (document.getElementById('lobby'))
const startGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('start-game'))
const leaveLobbyBtn = /** @type {HTMLButtonElement} */ (document.getElementById('leave-lobby'))
const playersDiv = /** @type {HTMLDivElement} */ (document.getElementById('players'))
const playersList = /** @type {HTMLDivElement[]} */ (Array.from(document.getElementsByClassName('player')))
if (lobbyDialogEl) {
    /* Prevent the 'Esc' key from closing the dialog */
    lobbyDialogEl.addEventListener('cancel', ev => ev.preventDefault())

    startGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
        ev.preventDefault()
        const action = { type: 'startGame' }
        socket.send(JSON.stringify(action))
        lobbyDialogEl.close()
    })

    leaveLobbyBtn.addEventListener('click', (/** @type MouseEvent*/ ev) => {
        ev.preventDefault()
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict'
        window.location.href = '/'
    })
}

const leaveRoomBtn = /** @type {HTMLButtonElement} */ (document.getElementById('leave-room'))
leaveRoomBtn.addEventListener('click', (/** @type MouseEvent*/ ev) => {
    ev.preventDefault()
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict'
    window.location.href = '/'
})

const cardEls = /** @type {HTMLButtonElement[]} */ (Array.from(document.getElementsByClassName('card')))
cardEls.forEach(agent => {
    agent.addEventListener('click', ev => {
        ev.preventDefault()
        const action = {
            type: 'cardClicked',
            payload: agent.innerText,
        }
        socket.send(JSON.stringify(action))
    })
})

const boardEl = document.getElementById('board')
boardEl.addEventListener('keydown', ev => {
    const el = /** @type {HTMLButtonElement} */ (ev.target)
    const idx = Number.parseInt(el.attributes.getNamedItem('data-index').value)

    const colShift = 1
    const rowShift = 5

    if (ev.key === 'ArrowUp' && idx > 4) {
        cardEls[idx - rowShift].focus()
    } else if (ev.key === 'ArrowDown' && idx < 20) {
        cardEls[idx + rowShift].focus()
    } else if (ev.key === 'ArrowLeft' && idx !== 0 && idx !== 5 && idx !== 10 && idx !== 15 && idx !== 20) {
        cardEls[idx - colShift].focus()
    } else if (ev.key === 'ArrowRight' && idx !== 4 && idx !== 9 && idx !== 14 && idx !== 19 && idx !== 24) {
        cardEls[idx + colShift].focus()
    }
})

// I hate this but I'm leaving it for now
function addNewPlayer(newPlayer) {
    const playerId = playersList.length
    const playerBox = document.createElement('div')
    playerBox.setAttribute('class', 'player')
    playerBox.setAttribute('id', `player-${playerId}`)

    const playerName = document.createElement('h4')
    playerName.innerText += newPlayer.username
    playerBox.appendChild(playerName)

    addPlayerOption(playerBox, 'role', 'spymaster', playerId)
    addPlayerOption(playerBox, 'role', 'operative', playerId)
    addPlayerOption(playerBox, 'team', 'red', playerId)
    addPlayerOption(playerBox, 'team', 'blue', playerId)

    playersDiv.appendChild(playerBox)
}

function addPlayerOption(parent, type, value, playerIndex) {
    const html = `<input type='radio' id='${value}' name='${type}-${playerIndex}' value='${value}'>\
                  <label for='${value}'>${value}</label>`
    parent.innerHTML += html
}

function removePlayer(playerId) {
    const player = document.getElementById(`player-${playerId}`)
    player.parentNode.removeChild(player)
}