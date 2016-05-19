/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')
const _ = require('underscore')
const app = require('../../src/app')
const io = require('socket.io-client')

var n = 0

function createMeeting () {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var activeMeeting = {
    _id: 'heartbeat-event' + n,
    participants: ['p1', 'p2'],
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

  it('should end a meeting after all heartbeats expire', function (done) {
    this.timeout(12000)
    var socket = io.connect('http://localhost:3000', {
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

  it('should add and remove a participant from heartbeat events', function (done) {
    this.timeout(15000)
    var socket = io.connect('http://localhost:3000', {
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

    setTimeout(function () {
      socket.emit('heartbeat-start', {
        participant: 'p2',
        meeting: meetingId
      })
    }, 8000)

    setTimeout(function () {
      app.service('meetings').get(meetingId)
         .then(function (meeting) {
           winston.log('info', 'heartbeat meeting:', meeting)
           assert(meeting.active === true)
           assert(meeting.participants.length === 1)
         }).then(function () {
           socket.emit('heartbeat-start', {
             participant: 'p1',
             meeting: meetingId
           })
           setTimeout(function () {
             app.service('meetings').get(meetingId)
                .then(function (meeting) {
                  assert(meeting.active === true)
                  assert(_.contains(meeting.participants, 'p1'))
                  socket.disconnect()
                  done()
                })
           }, 2000)
         }).catch(function (err) {
           socket.disconnect()
           winston.log('info', 'ERROR!', err)
           done(err)
         })
    }, 11000)
  })

  it('should add a participant if their hearbeat starts again', function (done) {
    this.timeout(12000)
    var socket = io.connect('http://localhost:3000', {
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

    setTimeout(function () {
      socket.emit('heartbeat-start', {
        participant: 'p2',
        meeting: meetingId
      })
    }, 8000)

    setTimeout(function () {
      app.service('meetings').get(meetingId)
         .then(function (meeting) {
           winston.log('info', 'heartbeat meeting:', meeting)
           assert(meeting.active === true)
           assert(meeting.participants.length === 1)
           socket.disconnect()
           done()
         }).catch(function (err) {
           socket.disconnect()
           done(err)
         })
    }, 11000)
  })
})
