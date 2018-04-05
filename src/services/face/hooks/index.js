'use strict'

const authHooks = require('@feathersjs/authentication').hooks
const roomHook = require('../../../hooks/roomHook').hook

exports.before = {
  all: [authHooks.verifyToken()],
  find: [],
  get: [],
  create: [roomHook],
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
