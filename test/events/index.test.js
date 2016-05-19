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

    var socket = io.connect('http://localhost:3000', {
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
