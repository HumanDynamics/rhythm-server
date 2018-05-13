/* eslint-env mocha */

'use strict'

const assert = require('assert')
const winston = require('winston')
const _ = require('underscore')
const dropDatabase = require('../../shared/global-before').dropDatabase

var n = 0

function createMeeting () {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var activeMeeting = {
    _id: 'add-participants-hook' + n,
    participants: [ 'p1', 'p2' ],
    startTime: d2,
    endTime: null,
    active: true
  }

  return global.app.service('meetings')
    .create(activeMeeting)
    .then(function (meeting) {
      assert(meeting.active === true)
      n += 1
      return meeting
    })
    .catch(function (err) {
      return err
    })
}

describe('add participants hook', function () {
  var meetingId = null
  before(function (done) {
    dropDatabase().then(() => { done() })
                  .catch((err) => { done(err) })
  })

  beforeEach(function (done) {
    createMeeting()
      .then(function (meeting) {
        meetingId = meeting
        done()
      })
      .catch(function (err) {
        done(err)
      })
  })

  afterEach(function (done) {
    global.app.service('meetings')
      .patch(meetingId, {
        participants: []
      })
      .then((meeting) => {
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  it('adds a participant to a meeting when it receives an add_participants query ', function (done) {
    /* eslint-disable camelcase */
    global.app.service('meetings')
      .patch(meetingId, {
        add_participant: 'p3'
      }, {})
      .then(function (meeting) {
        winston.log('info', 'added participants? :', meeting)
        assert(_.isEqual(meeting.participants, [ 'p1', 'p2', 'p3' ]))
        done()
      })
      .catch(function (err) {
        done(err)
      })
    /* eslint-enable camelcase */
  })

  it('patches without an add_participant query', function (done) {
    global.app.service('meetings')
      .patch(meetingId, {
        participants: [ 'p1', 'p2', 'p3', 'p4' ]
      })
      .then(function (meeting) {
        assert(_.isEqual(meeting.participants, [ 'p1', 'p2', 'p3', 'p4' ]))
        done()
      })
      .catch(function (err) {
        done(err)
      })
  })
})
