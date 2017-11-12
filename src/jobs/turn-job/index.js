// turns/index.js
// Tools to start and stop computation of turns for meetings.
'use strict'

const winston = require('winston')
const _ = require('underscore')
const turnAnalytics = require('./turn-analytics')

// local variables to keep track of job
var meetingProcessIds = {}
const TURNS_COMPUTE_INTERVAL = 5 * 1000
const TURNS_COMPUTE_WINDOW = 5 * 60 * 1000

var startComputingTurns = function (app, meeting) {
  winston.log('info', 'starting computing turns for meeting:', meeting._id)

  // if it's being run, don't start another one...
  if (_.has(meetingProcessIds, meeting._id)) {
    winston.log('info', 'already computing turns for meeting', meeting._id)
    return
  }

  // do one computation now
  turnAnalytics.computeTurns(app, meeting, new Date(Date.now() - TURNS_COMPUTE_WINDOW), new Date())

  var pid = setInterval(() => {
    turnAnalytics.computeTurns(app, meeting, new Date(Date.now() - TURNS_COMPUTE_WINDOW), new Date())
  }, TURNS_COMPUTE_INTERVAL)

  meetingProcessIds[meeting._id] = pid
}

var stopComputingTurns = function (meeting) {
  if (_.has(meetingProcessIds, meeting._id)) {
    winston.log('info', 'stopping computing turns for meeting:', meeting._id)
    var pid = meetingProcessIds[meeting._id]
    clearInterval(pid)
    delete meetingProcessIds[meeting._id]
  }
}

module.exports = {
  startJob: startComputingTurns,
  stopJob: stopComputingTurns,
  processList: meetingProcessIds
}
