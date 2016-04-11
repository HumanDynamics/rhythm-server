'use strict'

// Any filters that are shared across services are here
// decrypts data being sent out to users on service events.

const winston = require('winston')
const helpers = require('../helpers')
const transformKeys = helpers.transformKeys
const crypto = helpers.crypto

function decryptParticipantFilter (data, connection) {
  data = transformKeys(data,
                       ['participant', 'participants'],
                       crypto.decrypt)
  winston.log('info', 'data decrypted:', data)
  return data
}

module.exports = {
  decryptParticipantFilter: decryptParticipantFilter
}
