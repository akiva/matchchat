const assert = require('assert')

module.exports = (state, emitter) => {
  state.room = {
    roommate: null,
    roomId: null,
    messages: [],
  }

  emitter.on('room:message', data => {
    assert.equal(typeof data, 'object')
    state.room.messages = [ ...state.room.messages, data ]
    emitter.emit('render')
  })

  emitter.on('room:pair', data => {
    if (assert.notEqual(typeof data.roommate, null))
      assert.equal(typeof data.roommate, 'string')
    if (assert.notEqual(typeof data.roomId, undefined))
      assert.equal(typeof data.roomId, 'string')
    state.room.roommate = data.roommate
    state.room.roomId = data.roomId
    state.room.messages = []
    emitter.emit('render')
  })

  emitter.on('room:abandoned', (message) => {
    state.room.roommate =  null
    state.room.messages = [message]
    emitter.emit('render')
  })
}
