// compute-turn-hook.js
// A hook that manages the turn computation job.
// If a meeting has been changed to active, it starts computation. If it has
// been deemed inactive, it stops it.
'use strict'

const turnJob = require('../../../jobs').turnJob
const _ = require('underscore')

function shouldStartJob (meetingObject) {
  return (meetingObject.active && !_.has(turnJob.processList, meetingObject._id))
}

function shouldStopJob (meetingObject) {
  return (meetingObject.active === false && _.has(turnJob.processList, meetingObject._id))
}

module.exports = function (hook) {
  if (shouldStartJob(hook.result)) {
    turnJob.startJob(hook.app, hook.result._id)
  } else if (shouldStopJob(hook.result)) {
    turnJob.stopJob(hook.result._id)
  }
}
