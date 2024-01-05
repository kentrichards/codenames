const agentEls = /** @type {HTMLButtonElement[]} */ (Array.from(document.getElementsByClassName('agent')))
agentEls.forEach(agent => {
    agent.addEventListener('click', ev => {
        ev.preventDefault()
        console.log(agent.innerText)
    })
})

const boardEl = document.getElementById('board')
boardEl.addEventListener('keydown', ev => {
    const el = /** @type {HTMLButtonElement} */ (ev.target)
    const idx = Number.parseInt(el.attributes.getNamedItem('data-index').value)

    const colShift = 1
    const rowShift = 5

    if (ev.key === 'ArrowUp' && idx > 4) {
        agentEls[idx - rowShift].focus()
    } else if (ev.key === 'ArrowDown' && idx < 20) {
        agentEls[idx + rowShift].focus()
    } else if (ev.key === 'ArrowLeft' && idx !== 0 && idx !== 5 && idx !== 10 && idx !== 15 && idx !== 20) {
        agentEls[idx - colShift].focus()
    } else if (ev.key === 'ArrowRight' && idx !== 4 && idx !== 9 && idx !== 14 && idx !== 19 && idx !== 24) {
        agentEls[idx + colShift].focus()
    }
})
