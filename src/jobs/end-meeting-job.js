// end-meeting.js
// ends a meeting if no events have been sent to the server for a while
'use strict'

var Promise = require('promise')
const winston = require('winston')
const _ = require('underscore')

const MINUTE = 60 * 1000
const CHECK_END_INTERVAL = 0.1
const MAX_TIME_SINCE_LAST_UTTERANCE = Number(process.env.END_MEETING_AFTER_MINUTES) * MINUTE
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
    winston.log('error', 'Couldnt find any active meetings:', err)
    return []
  })
}

// returns an object that indicates whether the given meeting should be ended.
var isMeetingEnded = function (meeting, passedApp) {
  // TODO make this return true/false instead of an object
  winston.log('info', 'isMeetingEnded', meeting._id)
  var app = passedApp === undefined ? scope.app : passedApp
  return app.service('utterances').find({
    query: {
      meeting: meeting._id,
      $sort: {endTime: -1},
      $limit: 1
    }
  }).then((lastUtterances) => {
    var waitFor
    if (lastUtterances.length === 0) {
      waitFor = app.service('meetings').get(meeting._id).then((meetingObject) => {
        return (new Date().getTime() - new Date(meetingObject.startTime).getTime())
      })
    } else {
      waitFor = Promise.resolve(new Date().getTime() - new Date(lastUtterances[0].endTime).getTime())
    }
    return waitFor.then((elapsedTime) => {
      var meetingShouldEnd = elapsedTime > MAX_TIME_SINCE_LAST_UTTERANCE
      winston.log('info', 'should end?:', elapsedTime, MAX_TIME_SINCE_LAST_UTTERANCE)
      winston.log('info', 'should end?:', elapsedTime > MAX_TIME_SINCE_LAST_UTTERANCE)
      return {meetingShouldEnd: meetingShouldEnd,
              meeting: meeting}
    })
  }).catch((err) => {
    winston.log('error', 'Couldnt find last utterance:', err)
    // TODO maybe this is why meetings end if you havent spoken yet
    // despite the requisite elapsed time not passing
    return {meetingShouldEnd: true,
            meeting: meeting}
  })
}

var maybeEndMeeting = function (context, passedApp) {
  var app = passedApp === undefined ? scope.app : passedApp
  if (context.meetingShouldEnd) {
    winston.log('info', 'meetingShouldEnd', JSON.stringify(context.meeting))
    return app.service('meetings').patch(context.meeting, {participants: [], active: false})
              .then((patchedMeeting) => {
                winston.log('info', 'patched meeting w/ id: ', patchedMeeting._id)
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
    // TODO why don't we close over meeting arg here instead of returning an object
    // along that includes the meeting object?
    // maybe i'm missing something somewhere else? need to check all invocations
    // of isMeetingEnded
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
    pid = setInterval(monitorMeetings, CHECK_END_INTERVAL * 60 * 1000)
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
