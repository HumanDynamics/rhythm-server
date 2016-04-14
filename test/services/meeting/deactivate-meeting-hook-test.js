/* eslint-env mocha */

'use strict'

const assert = require('assert')
const winston = require('winston')

const app = require('../../../src/app')

var n = 0

function createMeeting () {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var activeMeeting = {
    _id: 'deactivate-meeting-hook-' + n,
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

describe('deactivate meeting hook', function () {
  var meetingId = null

  beforeEach(function (done) {
    createMeeting().then(function (meeting) {
      meetingId = meeting
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  it('sets an empty meeting inactive after all participants leave', function (done) {
    app.service('meetings').patch(meetingId, {
      participants: []
    }).then(function (meeting) {
      winston.log('info', 'deactivated meeting:', meeting)
      assert(meeting.active === false)
      assert(meeting.endTime !== null)
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  it('creates a meeting end event successfully', function (done) {
    app.service('meetings').patch(meetingId, {
      participants: []
    }).then(function (meeting) {
      app.service('meetingEvents').find({
        query: { $and: [{meeting: meetingId},
                        {event: 'end'}]
        }
      }).then(function (meetingEvents) {
        assert(meetingEvents.length > 0)
        done()
      }).catch(function (err) {
        done(err)
      })
    }).catch(function (err) {
      done(err)
    })
  })
})
