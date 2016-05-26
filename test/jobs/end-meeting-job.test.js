/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Faker = require('Faker')
const winston = require('winston')
const _ = require('underscore')

const app = require('../../src/app')
const endMeetingJob = require('../../src/jobs').endMeetingJob
endMeetingJob.app = app

var n = 0
var meetingId = null

function createMeetingAndUtterances (testName, ended, done) {
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

  app.service('meetings').create(testMeeting)
     .then(function (meeting) {
       _.each(testParticipants, function (participant, i, list) {
         app.service('participants').create(participant)
       })
       return testParticipants
     }).then(function (participants) {
       return app.service('utterances').create(
         {
           meeting: testMeeting._id,
           startTime: d1,
           endTime: d2,
           participant: participants[0]._id,
           volumes: _(10).times((n) => { return { 'timestamp': '1', 'vol': Faker.Helpers.randomNumber(5) } })
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
      createMeetingAndUtterances('end-meeting-job', true)
      endedMeeting = meetingId
      createMeetingAndUtterances('end-meeting-job', false, done)
      aliveMeeting = meetingId
    })

    it('should determine if a dead meeting is "ended"', function (done) {
      endMeetingJob._isMeetingEnded(endedMeeting, app).then(function (res) {
        assert(res.meetingShouldEnd)
        done()
      }).catch(function (err) {
        winston.log('info', '[end-meeting-job] error: ', err)
        done(err)
      })
    })

    it('should determine if a current meeting is not "ended"', function (done) {
      endMeetingJob._isMeetingEnded(aliveMeeting, app).then(function (res) {
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
      createMeetingAndUtterances('end-meeting-job', true)
      endedMeeting = meetingId
      createMeetingAndUtterances('end-meeting-job', false, done)
      aliveMeeting = meetingId
    })

    it('should change an inactive meetings ended state', function (done) {
      endMeetingJob._isMeetingEnded(endedMeeting, app).then(function (res) {
        assert(res.meetingShouldEnd)
        return endMeetingJob._maybeEndMeeting(res, app)
      }).then(function (didEndMeeting) {
        assert(didEndMeeting)
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('shouldnt change an active meetings end state', function (done) {
      endMeetingJob._isMeetingEnded(aliveMeeting, app).then(function (res) {
        assert(!res.meetingShouldEnd)
        return endMeetingJob._maybeEndMeeting(res, app)
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
    before(function (done) {
      createMeetingAndUtterances('end-meeting-job', true)
      endedMeeting = meetingId
      createMeetingAndUtterances('end-meeting-job', false, done)
      aliveMeeting = meetingId
    })

    it('should end all inactive meetings', function (done) {
      endMeetingJob._endInactiveMeetings([endedMeeting, aliveMeeting], app)
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
