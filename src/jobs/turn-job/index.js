// turns/index.js
// Tools to start and stop computation of turns for meetings.
'use strict'

const winston = require('winston')
const _ = require('underscore')
const turnAnalytics = require('turn-analytics')

// local variables to keep track of job
var meetingProcessIds = {}
const TURNS_COMPUTE_INTERVAL = 5 * 1000
const TURNS_COMPUTE_WINDOW = 5 * 60 * 1000

var startComputingTurns = function (meeting) {
  winston.log('info', 'starting computing turns for hangout:', meeting)

  // if it's being run, don't start another one...
  if (_.has(meetingProcessIds, meeting)) {
    winston.log('info', 'already computing turns for hangout', meeting)
    return
  }

  var pid = setInterval(function () {
    turnAnalytics.computeTurns(meeting, new Date(Date.now() - TURNS_COMPUTE_WINDOW), new Date())
  }, TURNS_COMPUTE_INTERVAL)

  meetingProcessIds[meeting] = pid
}

var stopComputingTurns = function (meeting) {
  if (_.has(meetingProcessIds, meeting)) {
    winston.log('info', 'stopping computing turns for hangout:', meeting)
    var pid = meetingProcessIds[meeting]
    clearInterval(pid)
    delete meetingProcessIds[meeting]
  }
}

module.exports = {
  startJob: startComputingTurns,
  stopJob: stopComputingTurns,
  processList: meetingProcessIds
}
