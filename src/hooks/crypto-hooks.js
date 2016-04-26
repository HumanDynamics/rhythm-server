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
    winston.log('debug', '>>> ENCRYPTING:', hook.data)

    function encryptIds (data) {
      return transformKeys(data, keys, crypto.encrypt)
    }

    if (hook.data != null) {
      var encryptedData = encryptIds(hook.data)
      hook.data = encryptedData
    }

    if (hook.params != null) {
      /* winston.log("debug", "encrypting params:", hook.params); */
      var encryptedParams = encryptIds(hook.params)
      /* winston.log("debug", "encrypted params:", encrypted_params); */
      hook.params = encryptedParams
    }
    return hook
  }
}

function decryptHook (keys) {
  return function (hook) {
    winston.log('debug', '>>>DECRYPTING:', hook.result)
    function decrypt_ids (data) {
      return transformKeys(data, keys, crypto.decrypt)
    }

    if (hook.result !== null) {
      var decrypted = decrypt_ids(hook.result)
      winston.log('info', 'decrypted:', decrypted)
      hook.result = decrypted
    }
    return hook
  }
}

module.exports = {
  decrypt: decryptHook,
  encrypt: encryptHook
}
