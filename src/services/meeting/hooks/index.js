'use strict'

const globalHooks = require('../../../hooks')
const authHooks = require('feathers-authentication').hooks
const computeTurnHook = require('./compute-turn-hook')
const activateMeetingHook = require('./activate-meeting-hook')
const deactivateMeetingHook = require('./deactivate-meeting-hook')
const participantsEventHook = require('./participants-event-hook')
const removeParticipantsHook = require('./remove-participants-hook')
const addParticipantHook = require('./add-participant-hook')
const extractUnstructuredQueryHook = require('./extract_unstructured_query-hook')
const applyUnstructuredQueryHook = require('./apply_unstructured_query-hook')

function addStartTime (hook) {
  hook.data.start_time = new Date()
  return hook
}

function updateTime (hook) {
  hook.data.lastUpdated = new Date()
  return hook
}

exports.before = {
  all: [authHooks.verifyToken()],
  create: [addStartTime,
           activateMeetingHook,
           globalHooks.encryptHook(['participants'])],
  find: [globalHooks.encryptHook(['participants']),
         extractUnstructuredQueryHook],
  update: [updateTime,
           globalHooks.encryptHook(['participants'])],
  patch: [updateTime, activateMeetingHook,
          deactivateMeetingHook,
          removeParticipantsHook,
          addParticipantHook,
          globalHooks.encryptHook(['participants'])],
  get: [globalHooks.encryptHook(['participants'])]
}

exports.after = {
  all: [globalHooks.decryptHook(['participants'])],
  create: [computeTurnHook, participantsEventHook],
  update: [computeTurnHook],
  patch: [computeTurnHook, participantsEventHook],
  find: [applyUnstructuredQueryHook]
}
