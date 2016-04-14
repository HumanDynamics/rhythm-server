'use strict'

const globalHooks = require('../../../hooks')
const computeTurnHook = require('./compute-turn-hook')
const activateMeetingHook = require('./activate-meeting-hook')
const deactivateMeetingHook = require('./deactivate-meeting-hook')
const participantsEventHook = require('./participants-event-hook')

function addStartTime (hook) {
  hook.data.start_time = new Date()
  return hook
}

function updateTime (hook) {
  hook.data.lastUpdated = new Date()
  return hook
}

exports.before = {
  all: [globalHooks.encryptHook(['participants'])],
  create: [addStartTime, activateMeetingHook],
  update: [updateTime],
  patch: [updateTime, activateMeetingHook, deactivateMeetingHook]
}

exports.after = {
  all: [globalHooks.decryptHook(['participants'])],
  create: [computeTurnHook, participantsEventHook],
  update: [computeTurnHook],
  patch: [computeTurnHook, participantsEventHook]
}
