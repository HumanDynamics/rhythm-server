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
    _id: 'remove-participants-hook' + n,
    participants: [ 'p1', 'p2', 'p3' ],
    startTime: d2,
    endTime: null,
    active: true
  }

  return global.app.service('meetings').create(activeMeeting)
            .then(function (meeting) {
              assert(meeting.active === true)
              n += 1
              return meeting
            }).catch(function (err) {
              return err
            })
}

describe('remove participants hook', function () {
  before(function (done) {
    dropDatabase().then(() => { done() })
                  .catch((err) => { done(err) })
  })

  var meetingId = null

  beforeEach(function (done) {
    createMeeting().then(function (meeting) {
      meetingId = meeting
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  afterEach(function (done) {
    global.global.app.service('meetings').patch(meetingId, {
      participants: []
    }).then((meeting) => {
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('removes a participant when it receives a remove_participants query ', function (done) {
    global.app.service('meetings').patch(meetingId, {
      remove_participants: [ 'p1', 'p2' ]
    }, {}).then(function (meeting) {
      winston.log('info', 'removed participants? :', meeting)
      assert(_.isEqual(meeting.participants, [ 'p3' ]))
      done()
    }).catch(function (err) {
      done(err)
    })
  })

  it('patches without a remove_participant query', function (done) {
    global.app.service('meetings').patch(meetingId, {
      participants: [ 'p1', 'p2', 'p3', 'p4' ]
    }).then(function (meeting) {
      assert(_.isEqual(meeting.participants, [ 'p1', 'p2', 'p3', 'p4' ]))
      done()
    }).catch(function (err) {
      done(err)
    })
  })
})
