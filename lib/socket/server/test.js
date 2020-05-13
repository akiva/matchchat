const test = require('tape')
const announceArrival = require('./announce-arrival')
const findAvailableRoom = require('./find-available-room')
const getRoommate = require('./get-roommate')
const joinOrCreateRoom = require('./join-or-create-room')
const leaveRoom = require('./leave-room')
const { WebSocket, Server } = require('mock-socket')
const fakeURL = 'ws://localhost:8000'
const mockServer = new Server(fakeURL)

const rooms = {
  'foo': [],
  'bar': ['socket1'],
  'baz': ['socket1', 'socket2'],
}

const sockets = {}

sockets['socket1'] = {
  id: 'socket1',
  name: 'Alice',
  socket: new WebSocket(fakeURL),
}

sockets['socket2'] = {
  id: 'socket1',
  name: 'Bob',
  socket: new WebSocket(fakeURL),
}

test('announceArrival', function (t) {
  t.plan(1)
  t.doesNotThrow(() =>
    announceArrival({
      rooms,
      sockets,
      roomId: 'baz',
      roommate: sockets.socket1
    })
  )
})

test('findAvailableRoom', function (t) {
  t.plan(2)
  t.deepEqual(
    findAvailableRoom(rooms, 'socket1'),
    -1
  )
  t.deepEqual(
    findAvailableRoom(rooms, 'socket1', 'bar'),
    -1
  )
})

test('getRoommate', function (t) {
  t.plan(3)
  t.deepEqual(
    getRoommate({ rooms, sockets, roomId: 'foo', socketId: 'socket1' }),
    null
  )
  t.deepEqual(
    getRoommate({ rooms, sockets, roomId: 'bar', socketId: 'socket1' }),
    null
  )
  t.deepEqual(
    getRoommate({ rooms, sockets, roomId: 'baz', socketId: 'socket1' }),
    {
      name: 'Bob',
      id: 'socket2',
    }
  )
})

test('joinOrCreateRoom', function (t) {
  t.plan(4)
  const test1 = joinOrCreateRoom({
    rooms,
    sockets,
    socketId: 'socket1',
  })
  const test2 = joinOrCreateRoom({
    rooms,
    sockets,
    socketId: 'socket2',
  })
  const test3 = joinOrCreateRoom({
    rooms,
    sockets,
    socketId: 'socket2',
    currentRoomId: 'foo'
  })
  const r = {
    'baz': ['socket1', 'socket2'],
  }
  const test4 = joinOrCreateRoom({
    rooms: r,
    sockets,
    socketId: 'socket2',
    currentRoomId: 'baz'
  })
  t.deepEqual(typeof test1, 'string')
  t.deepEqual(typeof test2, 'string')
  t.deepEqual(typeof test3, 'string')
  t.deepEqual(typeof test4, 'string')
})

test('leaveRoom', function (t) {
  t.plan(2)
  const initial = {
    'foo': ['socket1'],
    'bar': ['socket1', 'socket2'],
  }
  const expected1 = {
    'bar': ['socket1', 'socket2'],
  }
  const expected2 = {
    'foo': ['socket1'],
    'bar': ['socket2'],
  }
  t.deepEqual(
    leaveRoom(Object.assign({}, initial), 'foo', 'socket1'),
    expected1
  )
  t.deepEqual(
    leaveRoom(Object.assign({}, initial), 'bar', 'socket1'),
    expected2
  )
})
