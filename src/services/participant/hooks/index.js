'use strict'

const authHooks = require('feathers-authentication').hooks

exports.before = {
  all: [authHooks.verifyToken()],
  find: [],
  get: [],
  create: [],
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
