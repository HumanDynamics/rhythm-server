/* eslint-env mocha */
'use strict'

const assert = require('assert')
const io = require('socket.io-client')
const Faker = require('Faker')
const feathers = require('@feathersjs/client')
const _ = require('underscore')

const testUsers = 50
describe('Load tests', function () {
  this.timeout(30000)
  var ioIndex = 0

  it('creates ' + testUsers + ' sockets', function (done) {
    while (ioIndex < testUsers) {
      (function () {
        var socket = io.connect('http://localhost:3000', {
          'transports': [
            'websocket',
            'flashsocket',
            'jsonp-polling',
            'xhr-polling',
            'htmlfile'
          ],
          'force new connection': true
        })
        socket.emit('meetingJoined', {
          participant: 'participant' + ioIndex,
          name: 'Participant ' + ioIndex,
          meeting: 'meeting' + ioIndex,
          participants: []
        })

        var interval = Math.floor(Math.random() * 1001) + 1000
        var intervalId = setInterval(function () {
          socket.emit('utterance::create', {
            meeting: 'meeting' + ioIndex,
            participant: 'participant' + ioIndex,
            startTime: new Date(),
            endTime: new Date((new Date()).getTime() + 50),
            volumes: _(10).times((n) => { return Faker.Helpers.randomNumber(5) })
          })
          socket.emit('face::create', {
            meeting: 'meeting' + ioIndex,
            participant: 'participant' + ioIndex,
            start_time: new Date(),
            end_time: new Date((new Date()).getTime() + 50),
            timestamp: new Date(),
            face_delta: Faker.Helpers.randomNumber(5),
            delta_array: _(71).times((n) => { return [Faker.Helpers.randomNumber(5)] })
          })
        }, interval)

        setTimeout(function () {
          clearInterval(intervalId)
          socket.disconnect()
        }, 15000)
      })()
      ioIndex++
    }

    setTimeout(done, 25000)
  })

  it('receives turn events for each hangout', function (done) {
    var socket = io.connect('http://localhost:3000', {
      'transports': [
        'websocket',
        'flashsocket',
        'jsonp-polling',
        'xhr-polling',
        'htmlfile'
      ],
      'force new connection': true
    })
    var app = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket))
    var turns = app.service('turns')
    var recvdTurns = []
    for (var i = 0; i < testUsers; i++) { recvdTurns[i] = 0 }
    var isDone = false

    turns.on('created', function (turn) {
      var meeting = parseInt(turn.meeting.split('meeting')[1], 10)

      if (recvdTurns[meeting] >= 3) {
        if (!isDone) {
          isDone = true
          for (var i = 0; i < testUsers; i++) {
            assert.equal(recvdTurns[i], 3)
          }
          done()
          turns.off('created')
        }
      } else {
        recvdTurns[meeting] += 1
      }
    })
  })
})
