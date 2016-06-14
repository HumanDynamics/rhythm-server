/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')
const dropDatabase = require('../shared/global-before').dropDatabase
const io = require('socket.io-client')

describe('meeting joined event', function (done) {
  var fakeJoinedEvent = {
    participant: 'joinedParticipantId',
    meeting: 'meetingName',
    name: 'fakeParticipantName'
  }

  var socket = io.connect('http://localhost:3000', {
    'transports': [
      'websocket',
      'flashsocket',
      'jsonp-polling',
      'xhr-polling',
      'htmlfile'
    ]
  })

  before(function (done) {
    dropDatabase().then(() => {
      socket.emit('meetingJoined', fakeJoinedEvent)
      done()
    }).catch((err) => { done(err) })
  })

  after(function (done) {
    global.app.service('meetings').patch('meetingName', {
      active: false
    }).then((meeting) => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('creates a participant & meeting when they join for the first time', function (done) {
    this.timeout(2000)

    setTimeout(function () {
      global.app.service('participants').get(fakeJoinedEvent.participant)
            .then(function (participant) {
              winston.log('info', 'participant:', participant)
              assert(participant._id === fakeJoinedEvent.participant)
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
