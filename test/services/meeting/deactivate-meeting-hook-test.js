/* eslint-env mocha */

'use strict'

const assert = require('assert')
const winston = require('winston')

const app = require('../../../src/app')

describe('deactivate meeting hook', function () {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var activeMeeting = {
    _id: 'deactivate-meeting-hook',
    participants: ['p1', 'p2'],
    startTime: d2,
    endTime: null,
    active: true
  }

  before(function (done) {
    app.service('meetings').create(activeMeeting)
       .then(function (meeting) {
         assert(meeting.active === true)
         done()
       }).catch(function (err) {
         done(err)
       })
  })

  it('sets an empty meeting inactive after all participants leave', function (done) {
    app.service('meetings').patch(activeMeeting._id, {
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
})
