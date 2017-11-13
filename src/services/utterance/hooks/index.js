'use strict'

const repeatHook = require('./repeatHook').hook
const mergeHook = require('./mergeHook').hook
const roomHook = require('./roomHook').hook
const participantConsentedHook = require('./participant-consented-hook')
const authHooks = require('feathers-authentication').hooks

exports.before = {
  all: [authHooks.verifyToken()],
  find: [],
  get: [],
  create: [participantConsentedHook, roomHook, mergeHook, repeatHook],
  update: [],
  patch: [],
  remove: []
}

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
