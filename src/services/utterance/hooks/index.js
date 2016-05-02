'use strict'

const globalHooks = require('../../../hooks')
const repeatHook = require('./repeatHook').hook
const participantConsentedHook = require('./participant-consented-hook')

exports.before = {
  all: [globalHooks.encryptHook(['participant'])],
  find: [],
  get: [],
  create: [participantConsentedHook, repeatHook],
  update: [],
  patch: [],
  remove: []
}

exports.after = {
  all: [globalHooks.decryptHook(['participant'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
