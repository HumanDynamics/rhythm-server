/* eslint-env mocha */
'use strict'

const assert = require('assert')
const feathers = require('feathers-client')
const winston = require('winston')
const io = require('socket.io-client')

describe('microphone mute event', function (done) {
  var socket = io.connect('http://localhost:3000', {
    'transports': [
      'websocket',
      'flashsocket',
      'jsonp-polling',
      'xhr-polling',
      'htmlfile'
    ]
  })

  var app = feathers()
 .configure(feathers.hooks())
 .configure(feathers.socketio(socket))

  it('creates a microphone mute event', function (done) {
    assert(socket.connected)
    app.service('meetingEvents').on('created', function (event) {
      if (event.meeting === 'microphone-mute-1') {
        winston.log('info', 'mic event:', event)
        assert(event.data.isMicrophoneMute)
        app.service('meetingEvents').off('created')
        socket.disconnect()
        done()
      }
    })

    socket.emit('microphoneMute', {
      meetingId: 'microphone-mute-1',
      isMicrophoneMute: true,
      participantId: 'microphone-mute-participant-1'
    })
  })
})
