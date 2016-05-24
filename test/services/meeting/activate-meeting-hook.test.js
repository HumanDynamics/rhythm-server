/* eslint-env mocha */

'use strict'

const assert = require('assert')
const server = require('../../shared/server')
const app = require('../../../src/app')

server.load(app);

describe('activate meeting hook', function() {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var endedMeeting = {
    _id: 'activate-meeting-hook',
    participants: [],
    startTime: d2,
    endTime: d1,
    active: false
  }

  before(function(done) {
    app.service('meetings').create(endedMeeting).then(function(meeting) {
        done()
      })
      .catch(function(err) {
        done(err)
      })
  })

  it('sets an empty meeting active after a participant joins', function(done) {
    app.service('meetings').patch(endedMeeting._id, {
      participants: ['p1']
    }).then(function(meeting) {
      assert(meeting.active === true)
      assert(meeting.endTime === null)
      done()
    }).catch(function(err) {
      done(err)
    })
  })
})
