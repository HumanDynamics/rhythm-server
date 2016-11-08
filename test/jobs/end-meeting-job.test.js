/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')
const _ = require('underscore')

const endMeetingJob = require('../../src/jobs').endMeetingJob
endMeetingJob.app = global.app

var n = 0
var meetingId = null

function createMeetingAndUtterances (testName, ended, hasUtterances, done) {
  var d1 = null
  var d2 = null
  if (ended) {
    d1 = (new Date()).getTime() - 10 * 60 * 1000
    d2 = new Date(d1 + 1 * 60 * 1000)
  } else {
    d1 = (new Date()).getTime() - 1 * 60 * 1000
    d2 = new Date(d1 + 1 * 60 * 500)
  }

  var testParticipants = [
    {
      _id: testName + '-participant-' + n,
      consent: true,
      name: testName + '-participant-' + n
    },
    {
      _id: testName + '-participant-' + n,
      consent: true,
      name: testName + '-participant-' + n
    },
    {
      _id: testName + '-participant-' + n,
      consent: true,
      name: testName + '-participant-' + n
    }
  ]

  var testMeeting = {
    _id: testName + n,
    participants: [testParticipants[0]._id, testParticipants[1]._id],
    startTime: d1,
    endTime: null,
    active: true
  }

  meetingId = testName + n

  global.app.service('meetings').create(testMeeting)
     .then(function (meeting) {
       _.each(testParticipants, function (participant, i, list) {
         global.app.service('participants').create(participant)
       })
       return testParticipants
     }).then(function (participants) {
       if (!hasUtterances) {
         return
       }
       return global.app.service('utterances').create(
         {
           meeting: testMeeting._id,
           startTime: d1,
           endTime: d2,
           participant: testParticipants[0]._id
         })
     }).then(function (utterance) {
       if (done !== undefined) {
         done()
       }
     }).catch(function (err) {
       winston.log('info', '[end-meeting-job] error: ', err)
       if (done !== undefined) {
         done(err)
       }
     })

  n += 1
}

describe('end meeting job', function () {
  before(function () {
    endMeetingJob.stopJob()
  })
  describe('isMeetingEnded', function () {
    var endedMeeting = null
    var aliveMeeting = null
    before(function (done) {
      createMeetingAndUtterances('end-meeting-job', true, true)
      endedMeeting = meetingId
      createMeetingAndUtterances('end-meeting-job', false, true, done)
      aliveMeeting = meetingId
    })

    it('should determine if a dead meeting is "ended"', function (done) {
      endMeetingJob._isMeetingEnded(endedMeeting, global.app).then(function (res) {
        assert(res.meetingShouldEnd)
        done()
      }).catch(function (err) {
        winston.log('info', '[end-meeting-job] error: ', err)
        done(err)
      })
    })

    it('should determine if a current meeting is not "ended"', function (done) {
      endMeetingJob._isMeetingEnded(aliveMeeting, global.app).then(function (res) {
        assert(!res.meetingShouldEnd)
        done()
      }).catch(function (err) {
        winston.log('info', '[end-meeting-job] error: ', err)
        done(err)
      })
    })
  })

  describe('maybeEndMeeting', function () {
    var endedMeeting = null
    var aliveMeeting = null
    before(function (done) {
      createMeetingAndUtterances('end-meeting-job', true, true)
      endedMeeting = meetingId
      createMeetingAndUtterances('end-meeting-job', false, true, done)
      aliveMeeting = meetingId
    })

    it('should change an inactive meetings ended state', function (done) {
      endMeetingJob._isMeetingEnded(endedMeeting, global.app).then(function (res) {
        assert(res.meetingShouldEnd)
        return endMeetingJob._maybeEndMeeting(res, global.app)
      }).then(function (didEndMeeting) {
        assert(didEndMeeting)
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('shouldnt change an active meetings end state', function (done) {
      endMeetingJob._isMeetingEnded(aliveMeeting, global.app).then(function (res) {
        assert(!res.meetingShouldEnd)
        return endMeetingJob._maybeEndMeeting(res, global.app)
      }).then(function (didEndMeeting) {
        assert(!didEndMeeting)
        done()
      }).catch(function (err) {
        done(err)
      })
    })
  })

  describe('endInactiveMeetings', function () {
    var endedMeeting = null
    var aliveMeeting = null
    var endedMeetingWithoutUtterances = null
    var aliveMeetingWithoutUtterances = null
    before(function (done) {
      createMeetingAndUtterances('end-meeting-job', true, true)
      endedMeeting = meetingId
      createMeetingAndUtterances('end-meeting-job', false, true)
      aliveMeeting = meetingId
      createMeetingAndUtterances('end-meeting-job', true, false)
      endedMeetingWithoutUtterances = meetingId
      createMeetingAndUtterances('end-meeting-job', false, false, done)
      aliveMeetingWithoutUtterances = meetingId
    })

    it('should end all inactive meetings', function (done) {
      endMeetingJob._endInactiveMeetings([endedMeeting, aliveMeeting], global.app)
                   .then(function (endedMeetings) {
                     winston.log('info', '[end-meeting-job] ended meetings:', endedMeetings)
                     assert(endedMeetings[0])
                     assert(!endedMeetings[1])
                     done()
                   }).catch(function (err) {
                     done(err)
                   })
    })

    it('should end inactive meetings without utterances', function (done) {
      endMeetingJob._endInactiveMeetings([endedMeetingWithoutUtterances, aliveMeetingWithoutUtterances], global.app)
                   .then(function (endedMeetings) {
                     winston.log('info', '[end-meeting-job] ended meetings:', endedMeetings)
                     assert(endedMeetings[0])
                     assert(!endedMeetings[1])
                     done()
                   }).catch(function (err) {
                     done(err)
                   })
    })
  })
})
