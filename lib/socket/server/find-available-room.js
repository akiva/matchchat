const assert = require('assert').strict

module.exports = function findAvailableRoom (rooms, socketId, currentRoomId) {
  assert.equal(rooms instanceof Object, true)
  assert.equal(typeof socketId, 'string')
  if (typeof currentRoomId !== 'string')
    assert.equal(currentRoomId, undefined)
  else
    assert.equal(typeof currentRoomId, 'string')

  return Object.keys(rooms)
    .filter(id => id !== currentRoomId)
    .find(id => rooms[id].length === 1 && !rooms[id].includes(socketId)) || -1
}
