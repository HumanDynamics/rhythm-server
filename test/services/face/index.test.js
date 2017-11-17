/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')
const app = require('../../../src/app')
const io = require('socket.io-client')
const dropDatabase = require('../../shared/global-before').dropDatabase

describe('face service', () => {
  it('registered the faces service', () => {
    assert.ok(app.service('faces'))
  })

  var face = {
    participant: 'jordan',
    timestamp: new Date(),
    y_array: [],
    x_array: [],
    delta_array: [],
    room: 'room'
  }

  var fakeJoinedEvent = {
    participant: 'bob',
    room: 'room',
    name: 'fakeParticipantName',
    email: 'fake@email.com',
    consent: true,
    consentDate: new Date().toISOString()
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
      socket.disconnect()
      setTimeout(() => { done() }, 400)
    }).catch((err) => { done(err) })
  })

  it('created a face', function (done) {
    app.service('faces').create(face).then((created) => {
      winston.log('info', 'created fcace', JSON.stringify(created))
      assert.equal(created.meeting, 'room-1')
      done()
    }).catch((err) => done(err))
  })
})
