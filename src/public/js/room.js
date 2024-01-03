const socket = new WebSocket('ws://' + window.location.host + window.location.pathname)

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

const leaveRoomBtn = /** @type {HTMLButtonElement} */ (document.getElementById('leave-room'))
const msgInput = /** @type {HTMLInputElement} */ (document.getElementById('msg'))
const sendMsgBtn = /** @type {HTMLButtonElement} */ (document.getElementById('send-msg'))
const receivedMsgsEl = /** @type {HTMLDivElement} */ (document.getElementById('received-msgs'))

leaveRoomBtn.addEventListener('click', (/** @type MouseEvent */ ev) => {
    ev.preventDefault()
    window.location.href = '/'
})

sendMsgBtn.addEventListener('click', (/** @type MouseEvent */ ev) => {
    ev.preventDefault()

    const msg = msgInput.value
    if (!msg) return

    const action = {
        type: 'messageReceived',
        payload: msg,
    }
    socket.send(JSON.stringify(action))
})
