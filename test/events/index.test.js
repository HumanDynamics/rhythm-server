/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')
const dropDatabase = require('../shared/global-before').dropDatabase
const io = require('socket.io-client')

describe('meeting joined event', function (done) {
  var fakeJoinedEvent = {
    participant: 'joinedParticipantId',
    room: 'roomName',
    name: 'fakeParticipantName',
    email: 'fake@email.com'
  }

  var socket = io.connect('http://localhost:3000', {
    transports: [
      'websocket',
      'flashsocket',
      'jsonp-polling',
      'xhr-polling',
      'htmlfile',
    ]
  })

  var deactivateMeetings = function (room) {
    global.app.service('meetings')
      .find({ query: { room: fakeJoinedEvent.room } })
      .then((meetings) => {
        winston.log('info', 'deactivating meetings', meetings)
        meetings.forEach((meeting) => {
          let id = meeting._id
          global.app.service('meetings')
            .patch(id, {
              active: false
            })
            .then((meeting) => {
              winston.log('info', 'meeting deactivated', meeting)
            })
            .catch((err) => {
              done(err)
            })
        })
      })
  }

  before(function (done) {
    dropDatabase()
      .then(() => {
        socket.emit('meetingJoined', fakeJoinedEvent)
        setTimeout(() => { deactivateMeetings(fakeJoinedEvent.room) }, 400)
        setTimeout(() => { socket.emit('meetingJoined', fakeJoinedEvent) }, 800)
        setTimeout(() => { done() }, 1200)
      })
      .catch((err) => { done(err) })
  })

  after(function (done) {
    deactivateMeetings(fakeJoinedEvent.room)
    done()
  })

  it('creates a participant & meeting when they join for the first time', function (done) {
    setTimeout(function () {
      global.app.service('participants')
        .get(fakeJoinedEvent.participant)
        .then(function (participant) {
          winston.log('info', 'participant:', participant)
          assert.strictEqual(participant._id, fakeJoinedEvent.participant)
          socket.disconnect()
          done()
        })
        .catch(function (err) {
          winston.log('info', 'errrrrred', err)
          socket.disconnect()
          done(err)
        })
    }, 1500)
  })

  it('creates a meeting based on group name', function (done) {
    global.app.service('meetings')
      .find()
      .then((meetings) => {
        winston.log('info', 'mtgs: ', meetings)
        assert.strictEqual(meetings.length, 2)
        assert(meetings[0].active !== meetings[1].active)
        meetings.forEach((meeting) => {
          assert.strictEqual(meeting.room, fakeJoinedEvent.room)
          assert(meeting._id.startsWith(fakeJoinedEvent.room), 'meeting id starts with room name')
        })
      })
      .catch((err) => {
        done(err)
      })
    done()
  })
})
