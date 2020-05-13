const WebSocket = require('ws')
const cuid = require('cuid')
const getRoommate = require('./get-roommate')
const joinOrCreateRoom = require('./join-or-create-room')
const leaveRoom = require('./leave-room')
const sockets = {}
const rooms = {}

function noop() {}

function heartbeat() {
  this.isAlive = true
}

module.exports = function (server) {
  const ws = new WebSocket.Server({ server })

  ws.on('connection', function (socket, req) {
    socket.id = cuid()
    socket.isAlive = true
    socket.url = req.url
    socket.roomId = null
    socket.roommate = null
    sockets[socket.id] = { socket }

    socket.send(JSON.stringify({ type: 'connect', id: socket.id }))

    socket.on('pong', heartbeat)

    socket.on('message', function (message) {
      message = JSON.parse(message)

      if (message.type === 'user:join') {
        sockets[socket.id].name = message.name
        sockets[socket.id].roomId = joinOrCreateRoom({
          sockets,
          rooms,
          socketId: socket.id,
        })
        const data = {
          type: 'room:join',
          timestamp: Date.now(),
          name: message.name,
          id: socket.id,
          roomId: sockets[socket.id].roomId,
          roommate: sockets[socket.id].roommate,
        }
        sockets[socket.id].socket.send(JSON.stringify(data))
      }

      // If a user is leaving a chat, we will respond with useful
      // information regarding their new chat status. Namely, we will
      // notify both parties separately: the `leaving` user and the
      // `abandoned` user
      if (message.type === 'leave') {
        const leavingUser = message.sender
        const abandonedUser = sockets[socket.id].roommate
        // Messaging for user leaving room
        sockets[socket.id].roomId = joinOrCreateRoom({
          sockets,
          rooms,
          socketId: socket.id,
          currentRoomId: sockets[socket.id].roomId,
        })
        const newRoommate = getRoommate({
          rooms,
          sockets,
          roomId: sockets[socket.id].roomId,
          socketId: socket.id,
        })
        sockets[socket.id].roommate = newRoommate
        const pairingMsg = {
          type: 'room:pair',
          roommate: newRoommate,
        }
        sockets[socket.id].socket.send(JSON.stringify(pairingMsg))
        // Messaging for abandoned user
        const abandonedMsg = {
          type: 'room:abandoned',
          message: `${leavingUser.name} left the chat.`,
        }
        sockets[abandonedUser.id].roommate = null
        sockets[abandonedUser.id].socket.send(JSON.stringify(abandonedMsg))
      }

      if (message.type === 'message') {
        const roommate = sockets[socket.id].roommate
        const msg = {
          type: 'room:message',
          timestamp: Date.now(),
          sender: message.sender,
          recipient: roommate.name,
          message: message.message,
        }
        ;[socket, sockets[roommate.id].socket].forEach(socket =>
          socket.send(JSON.stringify(msg))
        )
      }
    })

    socket.on('close', (arg) => {
      clearInterval(interval)
      const leavingUser = sockets[socket.id].name
      const roommate = sockets[socket.id].roommate
      // Messaging for abandoned user
      if (roommate) {
        const data = {
          type: 'room:abandoned',
          message: `${leavingUser} left the chat.`,
        }
        sockets[roommate.id].roommate = null
        sockets[roommate.id].socket.send(JSON.stringify(data))
      }
      if (sockets[socket.id].roomId) {
        leaveRoom(rooms, sockets[socket.id].roomId, socket.id)
      }
      delete sockets[socket.id]
    })
  })

  const interval = setInterval(function () {
    ws.clients.forEach(function (ws) {
      if (ws.isAlive === false) return ws.terminate()
      ws.isAlive = false
      ws.ping(noop);
    })
  }, 30000)
}
