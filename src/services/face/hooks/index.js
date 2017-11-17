'use strict'

const authHooks = require('feathers-authentication').hooks
const roomHook = require('../../../hooks/roomHook').hook
const winston = require('winston')


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
