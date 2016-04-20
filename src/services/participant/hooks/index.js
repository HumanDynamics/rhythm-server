'use strict'

const globalHooks = require('../../../hooks')
const participantCryptoHooks = require('./participant-crypto-hooks.js')

exports.before = {
  all: [globalHooks.encryptHook(['_id', 'name'])],
  find: [],
  get: [participantCryptoHooks.encryptId],
  create: [],
  update: [participantCryptoHooks.encryptId],
  patch: [participantCryptoHooks.encryptId],
  remove: [participantCryptoHooks.encryptId]
}

exports.after = {
  all: [globalHooks.decryptHook(['_id', 'name'])],
  find: [],
  get: [participantCryptoHooks.decryptId],
  create: [],
  update: [participantCryptoHooks.decryptId],
  patch: [participantCryptoHooks.decryptId],
  remove: [participantCryptoHooks.decryptId]
}
