/* eslint-env mocha */

'use strict'

const assert = require('assert')
const io = require('socket.io-client')
const _ = require('underscore')
const feathers = require('feathers-client')

var socket = io('http://localhost:3030') // , {
  /* 'transports': [
     'websocket',
     'flashsocket',
     'htmlfile',
     'xhr-polling',
     'jsonp-polling'
     ]
     }) */

describe('meeting service', function () {
  var app = feathers()
 .configure(feathers.hooks())
 .configure(feathers.socketio(socket))

  it('can be connected to through socketio', function (done) {
    assert(socket.connected)
    const meetingService = app.service('meetings')
    var testMeeting = {
      _id: 'participants-patched-0',
      participants: ['ptest1', 'ptest2', 'ptest3'],
      startTime: new Date()
    }
    meetingService.create(testMeeting).then(function (meeting) {
      assert(meeting._id === testMeeting._id)
      done()
    }).catch(function (err) {
      done(err)
    })
  })
})

describe('meeting participants change', function () {
  var app = feathers()
 .configure(feathers.hooks())
 .configure(feathers.socketio(socket))

  after(function (done) {
    socket.disconnect()
    done()
  })

  it('sends out a patched event when someone leaves', function (done) {
    const meetingService = app.service('meetings')
    var testMeeting = {
      _id: 'participants-patched-1',
      participants: ['p1', 'p2', 'p3'],
      startTime: new Date()
    }
    var endParticipants = ['p1', 'p2']

    meetingService.on('patched', function (meeting) {
      if (meeting._id === testMeeting._id) {
        assert(!_.contains(meeting.participants, 'p3'))
        done()
      }
    })

    meetingService.create(testMeeting).then(function (meeting) {
      meetingService.patch(testMeeting._id, {
        participants: endParticipants
      }).then(function (meeting) {
      }).catch(function (err) {
        done(err)
      })
    }).catch(function (err) {
      done(err)
    })
  })

  it('sends out a patched event when someone enters', function (done) {
    const meetingService = app.service('meetings')
    var testMeeting = {
      _id: 'participants-patched-2',
      participants: ['p1', 'p2'],
      startTime: new Date()
    }
    var endParticipants = ['p1', 'p2', 'p3']

    meetingService.on('patched', function (meeting) {
      if (meeting._id === testMeeting._id) {
        assert(_.contains(meeting.participants, 'p3'))
        done()
      }
    })

    meetingService.create(testMeeting).then(function (meeting) {
      meetingService.patch(testMeeting._id, {
        participants: endParticipants
      }).then(function (meeting) {
        // nothing...
      }).catch(function (err) {
        done(err)
      })
    }).catch(function (err) {
      done(err)
    })
  })
})
