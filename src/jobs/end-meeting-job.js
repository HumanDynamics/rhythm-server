// end-meeting.js
// ends a meeting if no events have been sent to the server for a while
'use strict'

const winston = require('winston')
const _ = require('underscore')
const app = require('../app')

const MAX_TIME_SINCE_LAST_UTTERANCE = 5 * 60 * 1000
var pid = null

var getActiveMeetings = function () {
  return app.service('meetings').find({
    query: {
      active: true
    }
  }).then((meetings) => {
    return meetings
  }).catch((err) => {
    winston.log('error', 'Couldnt find all active meetings:', err)
    return false
  })
}

var isMeetingEnded = function (meeting) {
  return app.service('utterances').find({
    query: {
      meeting: meeting,
      $sort: {endTime: -1}
    }
  }).then((lastUtterance) => {
    return {meetingShouldEnd: lastUtterance.endTime > MAX_TIME_SINCE_LAST_UTTERANCE,
            meeting: meeting}
  }).catch((err) => {
    winston.log('error', 'Couldnt find last utterance:', err)
    return {meetingShouldEnd: false,
            meeting: meeting}
  })
}

var maybeEndMeeting = function (context) {
  if (context.meetingShouldEnd) {
    return app.service('meetings').patch(context.meeting, {participants: []})
              .then((patchedMeeting) => {
                return patchedMeeting.participants.length === 0 &&
                       patchedMeeting.active === false
              })
  } else {
    return false
  }
}

var endInactiveMeetings = function (meetings) {
  var endedMeetings = {}
  _.each(meetings, (meeting) => {
    endedMeetings[meeting] = isMeetingEnded(meeting).then(maybeEndMeeting)
  })
  return endedMeetings
}

var monitorMeetings = function () {
  // not sure that this promise chain works the way I'd like it to
  getActiveMeetings().then(endInactiveMeetings).then((endedMeetings) => {
    console.log('info', '(maybe) ended meetings:', endedMeetings)
  })
}

var startMonitoringMeetings = function () {
  if (pid) {
    return false
  } else {
    pid = setInterval(monitorMeetings, 1 * 60 * 1000)
  }
}

var stopMonitoringMeetings = function () {
  clearInterval(pid)
}

module.exports.startJob = startMonitoringMeetings
module.exports.stopJob = stopMonitoringMeetings
