/* eslint-env mocha */

'use strict'

const assert = require('assert')
const _ = require('underscore')
const app = require('../../../src/app')

var n = 0

function createMeeting () {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var activeMeeting = {
    _id: 'participants-event-hook-' + n,
    participants: [],
    startTime: d2,
    endTime: d1,
    active: false
  }

  return app.service('meetings').create(activeMeeting)
            .then(function (meeting) {
              assert(meeting.active === false)
              n += 1
              return meeting
            }).catch(function (err) {
              return err
            })
}

describe('participants event hook', function () {
  var meetingId = null

  beforeEach(function (done) {
    createMeeting().then(function (meeting) {
      meetingId = meeting
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  it('creates a participantEvent when a meeting is created', function (done) {
    app.service('participantEvents').find({
      query: {
        meeting: meetingId,
        $sort: {timestamp: -1}
      }
    }).then(function (participantEvents) {
      var participants = participantEvents.data[0].participants
      assert(participants.length === 0)
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  it('creates a participantEvent when a meeting is changed', function (done) {
    this.timeout = 3000
    app.service('meetings').patch(meetingId, {
      participants: ['p1', 'p2']
    }).then(function (meeting) {
      setTimeout(function () {
        app.service('participantEvents').find({
          query: {
            meeting: meetingId,
            $sort: {timestamp: -1}
          }
        }).then(function (participantEvents) {
          var participants = participantEvents.data[0].participants
          assert(_.contains(participants, 'p1'))
          assert(_.contains(participants, 'p2'))
          assert(participants.length === 2)
          done()
        }).catch(function (err) {
          done(err)
        })
      }, 1000)
    }).catch(function (err) {
      done(err)
    })
  })
})
