/* eslint-env mocha */

'use strict'

const assert = require('assert')
const _ = require('underscore')
const dropDatabase = require('../../shared/global-before').dropDatabase

describe('meeting participants change', function () {
  before(function (done) {
    dropDatabase().then(() => { done() })
                  .catch((err) => { done(err) })
  })

  it('sends out a patched event when someone leaves', function (done) {
    const meetingService = global.app.service('meetings')
    var testMeeting = {
      _id: 'participants-patched-1',
      participants: [ 'p1', 'p2', 'p3' ],
      startTime: new Date()
    }
    var endParticipants = [ 'p1', 'p2' ]

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
    const meetingService = global.app.service('meetings')
    var testMeeting = {
      _id: 'participants-patched-2',
      participants: [ 'p1', 'p2' ],
      startTime: new Date()
    }
    var endParticipants = [ 'p1', 'p2', 'p3' ]

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
