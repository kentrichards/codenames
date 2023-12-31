const socket = new WebSocket('ws://' + window.location.host + window.location.pathname)

socket.addEventListener('open', () => {
    const action = { type: 'userConnected' }
    socket.send(JSON.stringify(action))
})

socket.addEventListener('message', ev => {
    receivedMsgsEl.innerText += ev.data + '\n'
})

const msgInput = /** @type {HTMLInputElement} */ (document.getElementById('msg'))
const sendMsgBtn = /** @type {HTMLButtonElement} */ (document.getElementById('send-msg'))
const receivedMsgsEl = /** @type {HTMLDivElement} */ (document.getElementById('received-msgs'))

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
