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
            receivedMsgsEl.innerText += action.payload + '\n'
        } else {
            console.error(`Unknown message received: ${ev.data}`)
        }
    })
}

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
const msgInput = /** @type {HTMLInputElement} */ (document.getElementById('msg'))
const sendMsgBtn = /** @type {HTMLButtonElement} */ (document.getElementById('send-msg'))
const receivedMsgsEl = /** @type {HTMLDivElement} */ (document.getElementById('received-msgs'))

leaveRoomBtn.addEventListener('click', (/** @type MouseEvent*/ ev) => {
    ev.preventDefault()
    document.cookie = ''
    window.location.href = '/'
})

sendMsgBtn.addEventListener('click', (/** @type MouseEvent*/ ev) => {
    ev.preventDefault()

    const msg = msgInput.value
    if (!msg) return

    const action = {
        type: 'message',
        payload: msg,
    }
    socket.send(JSON.stringify(action))
})
