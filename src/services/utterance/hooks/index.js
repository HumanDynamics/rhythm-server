'use strict'

const globalHooks = require('../../../hooks')
const repeatHook = require('./repeatHook').hook
const participantConsentedHook = require('./participant-consented-hook')

exports.before = {
  all: [],
  find: [globalHooks.encryptHook(['participant'])],
  get: [globalHooks.encryptHook(['participant'])],
  create: [participantConsentedHook, repeatHook, globalHooks.encryptHook(['participant'])],
  update: [globalHooks.encryptHook(['participant'])],
  patch: [globalHooks.encryptHook(['participant'])],
  remove: [globalHooks.encryptHook(['participant'])]
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
