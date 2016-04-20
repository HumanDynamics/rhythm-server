'use strict'

// before hooks for encrypting/decrypting Ids for participants

const crypto = require('../../../helpers').crypto

function encryptIdHook (hook) {
  hook.id = crypto.encrypt(hook.id)
  return hook
}

function decryptIdHook (hook) {
  hook.id = crypto.decrypt(hook.id)
  return hook
}

module.exports = {
  encryptId: encryptIdHook,
  decryptId: decryptIdHook
}
