const assert = require('assert')

module.exports = (state, emitter) => {
  emitter.on('DOMContentLoaded', () => {
    const socket = new window.WebSocket('ws://localhost:8000')

    state.websocket = { open: false }

    socket.addEventListener('open', (event) => {
      emitter.on('ws:send', data => socket.send(data))
      state.websocket.open = true
    })

    socket.addEventListener('message', (event) => {
      const message = Object.assign({},
        JSON.parse(event.data)
      )

      if (message.type === 'connect')
        state.websocket.id = message.id

      if (message.type === 'room:join') {
        emitter.emit('user:join', {
          name: message.name,
          id: message.id,
        })
        emitter.emit('room:pair', {
          roomId: message.roomId,
          roommate: message.roommate,
        })
      }

      if (message.type === 'room:pair')
        emitter.emit('room:pair', {
          roomId: message.roomId,
          roommate: message.roommate,
        })

      if (message.type === 'room:abandoned')
        emitter.emit('room:abandoned', message)

      if (message.type === 'room:message')
        emitter.emit('room:message', message)
    })

    socket.addEventListener('close', (event) => {
      state.websocket.open = false
      emitter.emit('ws:close')
    })

    socket.addEventListener('error', (err) => {
      emitter.emit('ws:error', err)
    })
  })
}
