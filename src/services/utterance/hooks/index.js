'use strict'

const repeatHook = require('./repeatHook').hook
const participantConsentedHook = require('./participant-consented-hook')
const authHooks = require('feathers-authentication').hooks

exports.before = {
  all: [authHooks.verifyToken()],
  find: [],
  get: [],
  create: [participantConsentedHook, repeatHook],
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
