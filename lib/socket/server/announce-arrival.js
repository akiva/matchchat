const assert = require('assert').strict

module.exports = function announceArrival ({
  rooms,
  sockets,
  roomId,
  roommate
}) {
  assert.ok(rooms instanceof Object)
  assert.equal(typeof sockets, 'object')
  assert.equal(typeof roomId, 'string')
  assert.equal(typeof roommate, 'object')

  const myId = rooms[roomId].find(id => id !== roommate.id)
  const me = {
    id: myId,
    name: sockets[myId].name,
  }
  sockets[roommate.id].roommate = me
  const data = {
    type: 'room:pair',
    roomId: roomId,
    roommate: me,
  }
  return sockets[roommate.id].socket.send(JSON.stringify(data))
}
