'use strict'

const auth = require('@feathersjs/authentication')
const roomHook = require('../../../hooks/roomHook').hook

exports.before = {
  all: [auth.hooks.authenticate('jwt')],
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
