module.exports = function leaveRoom (rooms, roomId, socketId) {
  if (rooms[roomId].length === 1)
    delete rooms[roomId]
  else
    rooms[roomId] = rooms[roomId].filter(id => id !== socketId)
  return rooms
}
