const assert = require('assert').strict

module.exports = function getRoommate ({ rooms, sockets, roomId, socketId }) {
  assert.equal(typeof rooms, 'object')
  assert.equal(typeof sockets, 'object')
  assert.equal(typeof roomId, 'string')
  assert.equal(typeof socketId, 'string')

  return rooms[roomId].reduce((roommate, sid) => {
    if (sid !== socketId) {
      roommate = {
        name: sockets[sid].name,
        id: sid,
      }
    }
    return roommate
  }, null)
}
