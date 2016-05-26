// end-meeting.js
// ends a meeting if no events have been sent to the server for a while
'use strict'

var Promise = require('promise')
const winston = require('winston')
const _ = require('underscore')

const MAX_TIME_SINCE_LAST_UTTERANCE = 5 * 60 * 1000
var pid = null
var scope = {}

// returns a list of all active meetings, or false if an error occurred.
var getActiveMeetings = function () {
  return scope.app.service('meetings').find({
    query: {
      active: true
    }
  }).then((meetings) => {
    return meetings
  }).catch((err) => {
    winston.log('error', 'Couldnt find all active meetings:', err)
    return []
  })
}

// returns an object that indicates whether the given meeting should be ended.
var isMeetingEnded = function (meeting, passedApp) {
  var app = passedApp === undefined ? scope.app : passedApp
  return app.service('utterances').find({
    query: {
      meeting: meeting,
      $sort: {endTime: -1}
    }
  }).then((lastUtterances) => {
    if (lastUtterances[0].length === 0) {
      return {meetingShouldEnd: false,
              meeting: meeting}
    }
    var msSinceLastUtterance = (new Date().getTime() - new Date(lastUtterances[0].endTime).getTime())
    var meetingShouldEnd = false
    if (lastUtterances.length > 0) {
      meetingShouldEnd = msSinceLastUtterance > MAX_TIME_SINCE_LAST_UTTERANCE
    }
    return {meetingShouldEnd: meetingShouldEnd,
            meeting: meeting}
  }).catch((err) => {
    winston.log('error', 'Couldnt find last utterance:', err)
    return {meetingShouldEnd: true,
            meeting: meeting}
  })
}

var maybeEndMeeting = function (context, passedApp) {
  var app = passedApp === undefined ? scope.app : passedApp
  if (context.meetingShouldEnd) {
    return app.service('meetings').patch(context.meeting, {participants: []})
              .then((patchedMeeting) => {
                winston.log('info', 'patched meeting:', patchedMeeting)
                return patchedMeeting.participants.length === 0 &&
                       patchedMeeting.active === false
              }).catch((err) => {
                winston.log('info', 'Couldnt patch meeting!', err)
                return false
              })
  } else {
    return false
  }
}

var endInactiveMeetings = function (meetings, passedApp) {
  /* if (meetings === false) {
     return {}
     } */
  var app = passedApp === undefined ? scope.app : passedApp
  return Promise.all(_.map(meetings, (meeting) => {
    return isMeetingEnded(meeting, app).then((meetingEnded) => { return maybeEndMeeting(meetingEnded, app) })
  }))
}

var monitorMeetings = function () {
  // not sure that this promise chain works the way I'd like it to
  winston.log('info', '[end-meeting-job] checking all meetings...')
  getActiveMeetings().then(endInactiveMeetings).then((endedMeetings) => {
    console.log('info', '(maybe) ended meetings:', endedMeetings)
  }).catch((err) => {
    console.log('info', 'oops:', err)
  })
}

var startMonitoringMeetings = function (app) {
  scope.app = app
  if (pid) {
    return false
  } else {
    winston.log('info', '[end-meeting-job] Starting to monitor meetings...')
    pid = setInterval(monitorMeetings, 1 * 60 * 1000)
  }
}

var stopMonitoringMeetings = function () {
  clearInterval(pid)
}

module.exports = {
  _isMeetingEnded: isMeetingEnded,
  _endInactiveMeetings: endInactiveMeetings,
  _maybeEndMeeting: maybeEndMeeting,
  startJob: startMonitoringMeetings,
  stopJob: stopMonitoringMeetings
}
