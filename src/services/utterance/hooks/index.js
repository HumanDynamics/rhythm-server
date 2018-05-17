'use strict'

const repeatHook = require('./repeatHook').hook
const mergeHook = require('./mergeHook').hook
const roomHook = require('../../../hooks/roomHook').hook
const participantConsentedHook = require('./participant-consented-hook')
const auth = require('@feathersjs/authentication')

exports.before = {
  all: [ auth.hooks.authenticate('jwt') ],
  find: [],
  get: [],
  create: [ participantConsentedHook, roomHook, mergeHook, repeatHook ],
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
