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
        } else if (action.type === 'message') {
            // TODO: Remove eventually
            console.log('message received', action.payload)
        } else if (action.type === 'revealCard') {
            const { agent, cardType, scoreMsg } = action.payload
            const card = cardEls.find(card => card.innerText === agent)
            card.classList.add(cardType)
            scoreEl.innerHTML = scoreMsg
        } else if (action.type === 'endTurnForced') {
            const { agent, cardType, scoreMsg, newTurnMsg } = action.payload
            const card = cardEls.find(card => card.innerText === agent)
            card.classList.add(cardType)
            scoreEl.innerHTML = scoreMsg
            turnEl.innerText = newTurnMsg
        } else if (action.type === 'userConnected' || action.type === 'userDisconnected') {
            teamsEl.innerHTML = action.payload
        } else if (action.type === 'newGame') {
            const { newBoard, scoreMsg, turnMsg } = action.payload
            boardEl.innerHTML = newBoard
            scoreEl.innerHTML = scoreMsg
            turnEl.innerText = turnMsg
            cardEls = /** @type {HTMLButtonElement[]} */ (Array.from(document.getElementsByClassName('card')))
            attachCardListeners()
        } else if (action.type === 'endTurnClicked') {
            turnEl.innerText = action.payload
        } else if (action.type === 'gameOver') {
            const { agent, cardType, winnerMsg, scoreMsg } = action.payload
            const card = cardEls.find(card => card.innerText === agent)
            card.classList.add(cardType)
            scoreEl.innerHTML = scoreMsg
            turnEl.innerText = winnerMsg
        } else {
            console.error(`Unknown message received: ${ev.data}`)
        }
    })
}

const scoreEl = /** @type {HTMLParagraphElement} */ (document.getElementById('scores'))

const turnEl = /** @type {HTMLParagraphElement} */ (document.querySelector('#turn > p'))
const teamsEl = /** @type {HTMLDivElement} */ (document.getElementById('teams'))

const dialogEl = /** @type {HTMLDialogElement} */ (document.querySelector('dialog'))
const usernameInput = /** @type {HTMLInputElement} */ (document.getElementById('username'))
const submitBtn = /** @type {HTMLButtonElement} */ (document.getElementById('submit'))

if (dialogEl && usernameInput && submitBtn) {
    /* Prevent the 'Esc' key from closing the dialog */
    dialogEl.addEventListener('cancel', ev => ev.preventDefault())

    submitBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
        ev.preventDefault()

        const username = usernameInput.value
        if (!username) {
            console.error('Username required to create game')
            return
        }

        document.cookie = `username=${username}; SameSite=Strict`
        dialogEl.close()
        openWebSocketConnection()
    })
} else {
    // If these elements don't exist, the username dialog must not have been sent by the
    // server, which means a username cookie already exists from a previous session
    openWebSocketConnection()
}

const leaveRoomBtn = /** @type {HTMLButtonElement} */ (document.getElementById('leave-room'))
leaveRoomBtn.addEventListener('click', (/** @type MouseEvent*/ ev) => {
    ev.preventDefault()
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict'
    window.location.href = '/'
})

let linkCopiedTimeout
let linkRecentlyCopied = false
const copyLinkBtn = /** @type {HTMLButtonElement} */ (document.getElementById('copy-link'))
const copyLinkBtnWidth = copyLinkBtn.getBoundingClientRect().width
const copyLinkBtnHeight = copyLinkBtn.getBoundingClientRect().height
const copyLinkBtnContent = copyLinkBtn.innerHTML
copyLinkBtn.addEventListener('click', (/** @type MouseEvent */ ev) => {
    ev.preventDefault()
    const inviteLink = window.location.href

    navigator.clipboard
        .writeText(inviteLink)
        .then(() => {
            if (!linkRecentlyCopied) {
                copyLinkBtn.innerHTML = 'Copied!'
                copyLinkBtn.style.width = `${copyLinkBtnWidth}px`
                copyLinkBtn.style.height = `${copyLinkBtnHeight}px`
                linkRecentlyCopied = true
            } else {
                clearTimeout(linkCopiedTimeout)
            }

            linkCopiedTimeout = setTimeout(() => {
                copyLinkBtn.innerHTML = copyLinkBtnContent
                linkRecentlyCopied = false
            }, 3000)
        })
        .catch(() => console.error('Failed to copy invite link:', inviteLink))
})

let cardEls = /** @type {HTMLButtonElement[]} */ (Array.from(document.getElementsByClassName('card')))
function attachCardListeners() {
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
}
attachCardListeners()

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

const newGameBtn = /** @type {HTMLButtonElement} */ (document.getElementById('new-game'))
newGameBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()
    const action = { type: 'newGame' }
    socket.send(JSON.stringify(action))
})

const endTurnBtn = /** @type {HTMLButtonElement} */ (document.getElementById('end-turn'))
endTurnBtn.addEventListener('click', (/** @type {MouseEvent} */ ev) => {
    ev.preventDefault()
    const action = { type: 'endTurnClicked' }
    socket.send(JSON.stringify(action))
})
