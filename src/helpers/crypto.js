'use strict'

// crypto.js - some simple cryptography tools

const fs = require('fs')
const crypto = require('crypto')

const algorithm = 'aes-256-ctr'

// Nodejs encryption with CTR

function encrypt (text) {
  var cipher = crypto.createCipher(algorithm, process.env.CRYPTO_KEY)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt (text) {
  var decipher = crypto.createDecipher(algorithm, process.env.CRYPTO_KEY)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}
