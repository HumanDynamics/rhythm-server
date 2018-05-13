/* eslint-env mocha */

'use strict'

const _ = require('underscore')
const assert = require('assert')
const winston = require('winston')
const dropDatabase = require('../../shared/global-before').dropDatabase

var n = 0

function createMeetingAndUtterances (testName) {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)
  var d3 = d2 + 10 * 1000
  var d4 = d3 + 30 * 1000
  var d5 = d4 + 20 * 1000

  var testParticipants = [
    {
      _id: testName + '-participant-' + n + '-id-0',
      consent: true,
      name: testName + '-participant-' + n + '-name-0'
    },
    {
      _id: testName + '-participant-' + n + '-id-1',
      consent: true,
      name: testName + '-participant-' + n + '-name-1'
    },
    {
      _id: testName + '-participant-' + n + '-id-2',
      consent: true,
      name: testName + '-participant-' + n + '-name-2'
    }
  ]

  var testMeeting = {
    _id: testName + n,
    participants: [ testParticipants[0]._id, testParticipants[1]._id, testParticipants[2]._id ],
    startTime: d2,
    endTime: null,
    active: true
  }

  var testUtterances = [
    {
      meeting: testMeeting._id,
      startTime: d2,
      endTime: d3,
      participant: testParticipants[0]._id
    },
    {
      meeting: testMeeting._id,
      startTime: d4,
      endTime: d5,
      participant: testParticipants[0]._id
    },
    {
      meeting: testMeeting._id,
      startTime: d3,
      endTime: d4,
      participant: testParticipants[1]._id
    }
  ]

  return global.app.service('meetings')
    .create(testMeeting)
    .then(function (meeting) {
      _.each(testParticipants, function (participant, i, list) {
        global.app.service('participants').create(participant)
      })
      _.each(testUtterances, function (utterance, i, list) {
        global.app.service('utterances').create(utterance)
      })
      assert(meeting.active === true)
      n += 1
      return meeting
    })
    .catch(function (err) {
      return err
    })
}

describe('deactivate meeting hook', function () {
  var meetingId = null

  before(function (done) {
    dropDatabase().then(() => { done() })
                  .catch((err) => { done(err) })
  })

  beforeEach(function (done) {
    createMeetingAndUtterances('deactivate-meeting-hook')
      .then(function (meeting) {
        meetingId = meeting
        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('sets an empty meeting inactive after all participants leave', function (done) {
    global.app.service('meetings')
      .patch(meetingId, {
        participants: []
      })
      .then(function (meeting) {
        winston.log('info', 'deactivated meeting:', meeting)
        assert(meeting.active === false)
        assert(meeting.endTime !== null)
        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  it('creates a meeting end event successfully', function (done) {
    global.app.service('meetings')
      .patch(meetingId, {
        participants: []
      })
      .then(function (meeting) {
        global.app.service('meetingEvents')
          .find({
            query: { $and: [{ meeting: meetingId },
                            { event: 'end' }]
            }
          })
          .then(function (meetingEvents) {
            assert(meetingEvents.length > 0)
            done()
          })
          .catch(function (err) {
            done(err)
          })
      })
      .catch(function (err) {
        done(err)
      })
  })
})
