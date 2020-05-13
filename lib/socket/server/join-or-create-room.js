const assert = require('assert').strict
const announceArrival = require('./announce-arrival')
const findAvailableRoom = require('./find-available-room')
const getRoommate = require('./get-roommate')
const leaveRoom = require('./leave-room')
const cuid = require('cuid')

module.exports = function joinOrCreateRoom ({
  sockets,
  rooms,
  socketId,
  currentRoomId
}) {
  assert.equal(sockets instanceof Object, true)
  assert.equal(rooms instanceof Object, true)
  assert.equal(typeof socketId, 'string')
  if (currentRoomId !== undefined)
    assert.equal(typeof currentRoomId, 'string')

  let availableRoomId = findAvailableRoom(rooms, socketId, currentRoomId)
  // If there was no available rooms, leave the current one and create a
  // new one
  if (availableRoomId === -1) {
    if (currentRoomId !== undefined)
      leaveRoom(rooms, currentRoomId, socketId)
    availableRoomId = cuid()
    rooms[availableRoomId] = [socketId]
  }
  // If there was an available room to enter, notify other occupant of
  // new roommate entering the room
  else {
    rooms[availableRoomId].push(socketId)
    const roommate = getRoommate({
      rooms,
      sockets,
      roomId: availableRoomId,
      socketId
    })
    sockets[socketId].roommate = roommate
    announceArrival({ rooms, sockets, roomId: availableRoomId, roommate })
  }
  return availableRoomId
}
