' use strict'

// crypto-hooks.js
//
// A collection of feathers hooks to encrypt and decrypt objects in-transit.

const winston = require('winston')
const helpers = require('../helpers')
const crypto = helpers.crypto
const transformKeys = helpers.transformKeys

function encryptHook (keys) {
  return function (hook) {
    // winston.log('info', '>>> ENCRYPTING:', hook.data, hook.params.query, hook.method)

    function encryptIds (data) {
      return transformKeys(data, keys, crypto.encrypt)
    }

    if (hook.data !== undefined) {
      var encryptedData = encryptIds(hook.data)
      hook.data = encryptedData
      return hook
    }

    if (hook.params.query !== {} && hook.params.query !== undefined) {
      var encryptedQuery = encryptIds(hook.params.query)
      hook.params.query = encryptedQuery
      return hook
    }

    return hook
  }
}

function decryptHook (keys) {
  return function (hook) {
    // winston.log('info', '>>>DECRYPTING..')
    function decrypt_ids (data) {
      return transformKeys(data, keys, crypto.decrypt)
    }

    if (hook.result !== null) {
      var decrypted = decrypt_ids(hook.result)
      // winston.log('info', 'decrypted:', decrypted)
      hook.result = decrypted
      return hook
    }
    return hook
  }
}

module.exports = {
  decrypt: decryptHook,
  encrypt: encryptHook
}
