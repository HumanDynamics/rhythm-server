'use strict'

const globalHooks = require('../../../hooks')
const authHooks = require('feathers-authentication').hooks

exports.before = {
  all: [authHooks.verifyToken(), globalHooks.encryptHook(['participant'])],
  find: [],
  get: [],
  create: [],
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
