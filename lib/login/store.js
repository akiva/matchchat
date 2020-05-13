const assert = require('assert')

module.exports = (state, emitter) => {
  state.user = {
    id: null,
    name: null,
    loggedIn: false,
  }

  emitter.on('user:join', data => {
    assert.equal(typeof data.id, 'string')
    assert.equal(typeof data.name, 'string')
    state.user.id = data.id
    state.user.name = data.name
    state.user.loggedIn = true
  })
}
