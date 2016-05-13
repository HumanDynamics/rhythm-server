'use strict'

const assert = require('assert')
const feathers = require('feathers-client')
const io = require('socket.io-client')
const _ = require('underscore')

describe('Meeting event', function () {

  it('creates a microphone mute meeting event', function (done) {
    var payload = {
      participantId: '77777777777',
      meetingId: '123456789',
      isMicrophoneMute: true
    }

    var options = { 'transports': [
    'websocket',
    'flashsocket',
    'jsonp-polling',
    'xhr-polling',
    'htmlfile'
    ]}

    var socket = io('http://localhost:3000', options)

    var app = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket))

    app.service('meetingEvents').on('created', function (event) {
      assert(_.isEqual(event.meeting, payload.meetingId))
      assert(_.isEqual(event.data.participant, payload.participantId))
      assert(_.isEqual(event.data.isMicrophoneMute, payload.isMicrophoneMute))

      socket.disconnect()
      done()
    })

    socket.emit('microphoneMute', payload)
  })
})
