/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')

const app = require('../../src/app')
const io = require('socket.io-client')

describe('meeting joined event', function (done) {
  it('creates a participant & meeting when they join for the first time', function (done) {
    this.timeout(2000)

    var fakeJoinedEvent = {
      participant: 'joinedParticipantId',
      meeting: 'meetingName',
      name: 'fakeParticipantName'
    }

    var socket = io.connect('http://localhost:3030', {
      'transports': [
        'websocket',
        'flashsocket',
        'jsonp-polling',
        'xhr-polling',
        'htmlfile'
      ]
    })

    socket.emit('meetingJoined', fakeJoinedEvent)

    setTimeout(function () {
      app.service('participants')
         .find({
           query: {
             _id: fakeJoinedEvent.participant
           }
         }).then(function (participant) {
           winston.log('info', '>>> data from joined event:', participant.data[0]._id === fakeJoinedEvent.participant)
           assert(participant.data[0]._id === fakeJoinedEvent.participant)
           socket.disconnect()
           done()
         }).catch(function (err) {
           winston.log('info', 'errrrrred', err)
           socket.disconnect()
           done(err)
         })
    }, 1500)
  })
})

var n = 0

function createMeeting () {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var activeMeeting = {
    _id: 'heartbeat-event' + n,
    participants: ['ph1', 'ph2'],
    startTime: d2,
    endTime: null,
    active: true
  }

  return app.service('meetings').create(activeMeeting)
            .then(function (meeting) {
              assert(meeting.active === true)
              n += 1
              return meeting
            }).catch(function (err) {
              return err
            })
}

describe('heartbeats', function () {
  var meetingId = null

  beforeEach(function (done) {
    createMeeting().then(function (meeting) {
      meetingId = meeting._id
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  it('should end a meeting after the heartbeat expires', function (done) {
    this.timeout(12000)
    var socket = io.connect('http://localhost:3030', {
      'transports': [
        'websocket',
        'flashsocket',
        'jsonp-polling',
        'xhr-polling',
        'htmlfile'
      ]
    })
    socket.emit('heartbeat-start', {
      participant: 'p1',
      meeting: meetingId
    })
    socket.emit('heartbeat-start', {
      participant: 'p2',
      meeting: meetingId
    })

    setTimeout(function () {
      app.service('meetings').get(meetingId)
         .then(function (meeting) {
           assert(meeting.active === false)
           assert(meeting.participants.length === 0)
           socket.disconnect()
           done()
         }).catch(function (err) {
           socket.disconnect()
           done(err)
         })
    }, 11000)
  })
})
