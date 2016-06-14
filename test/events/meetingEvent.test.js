/* eslint-env mocha */
'use strict'

const assert = require('assert')
const dropDatabase = require('../shared/global-before').dropDatabase
const io = require('socket.io-client')
const _ = require('underscore')

describe('Meeting event', function () {
  before(function (done) {
    dropDatabase().then(() => { done() })
                  .catch((err) => { done(err) })
  })

  after(function () {
    global.app.service('meetingEvents').off('created')
  })

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

    global.app.service('meetingEvents').on('created', function (event) {
      assert(_.isEqual(event.meeting, payload.meetingId))
      assert(_.isEqual(event.data.participant, payload.participantId))
      assert(_.isEqual(event.data.isMicrophoneMute, payload.isMicrophoneMute))

      socket.disconnect()
      done()
    })

    socket.emit('microphoneMute', payload)
  })
})
