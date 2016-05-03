'use strict'

const globalHooks = require('../../../hooks')
const computeTurnHook = require('./compute-turn-hook')
const activateMeetingHook = require('./activate-meeting-hook')
const deactivateMeetingHook = require('./deactivate-meeting-hook')
const participantsEventHook = require('./participants-event-hook')
const removeParticipantsHook = require('./remove-participants-hook')

function addStartTime (hook) {
  hook.data.start_time = new Date()
  return hook
}

function updateTime (hook) {
  hook.data.lastUpdated = new Date()
  return hook
}

exports.before = {
  create: [addStartTime, activateMeetingHook, globalHooks.encryptHook(['participants'])],
  find: [globalHooks.encryptHook(['participants'])],
  update: [updateTime, globalHooks.encryptHook(['participants'])],
  patch: [updateTime, activateMeetingHook,
          deactivateMeetingHook, removeParticipantsHook,
          globalHooks.encryptHook(['participants'])],
  get: [globalHooks.encryptHook(['participants'])]
}

exports.after = {
  create: [computeTurnHook, participantsEventHook],
  update: [computeTurnHook],
  patch: [computeTurnHook, participantsEventHook],
  all: [globalHooks.decryptHook(['participants'])]
}
