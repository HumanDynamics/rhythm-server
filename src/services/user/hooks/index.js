'use strict'

const auth = require('@feathersjs/authentication')
const local = require('@feathersjs/authentication-local')
const { discard } = require('feathers-hooks-common')

const { restrictToOwner } = require('feathers-authentication-hooks')

exports.before = {
  all: [],
  find: [
    auth.hooks.authenticate('jwt')
  ],
  get: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: '_id' })
  ],
  create: [
    auth.hooks.authenticate('jwt'),
    local.hooks.hashPassword()
  ],
  update: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: '_id' })
  ],
  patch: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: '_id' })
  ],
  remove: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: '_id' })
  ]
}

exports.after = {
  all: [discard('password')],   // remove password field once authentication is done
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
