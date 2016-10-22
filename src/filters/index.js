'use strict'

// Any filters that are shared across services are here
// decrypts data being sent out to users on service events.

const winston = require('winston')
const helpers = require('../helpers')
const transformKeys = helpers.transformKeys
const crypto = helpers.crypto

function decryptParticipantFilter (data, connection) {
  var transformed = transformKeys(data,
                                  ['participant', 'participants'],
                                  crypto.decrypt)
  winston.log('info', 'filter decrypted:', transformed)
  return transformed
}

function authenticationFilter (data, connection) {
  winston.log('info', 'auth filter, data:', connection.user, data)
  if (!connection.user) {
      winston.log('info', 'User not authenticated.', connection.user)
    return false
  }
  return data
}

module.exports = {
  decryptParticipantFilter: decryptParticipantFilter,
  authenticationFilter: authenticationFilter
}
