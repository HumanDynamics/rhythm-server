'use strict'

const globalHooks = require('../../../hooks')
const authHooks = require('feathers-authentication').hooks

exports.before = {
  all: [authHooks.verifyToken(), globalHooks.encryptHook(['participants'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}

exports.after = {
  all: [globalHooks.decryptHook(['participants'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
