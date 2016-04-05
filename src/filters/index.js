'use strict'

// Any filters that are shared across services are here
// decrypts data being sent out to users on service events.

const winston = require('winston')
const helpers = require('../helpers')
const transformKeys = helpers.transformKeys
const crypto = helpers.crypto

function encryptParticipantFilter (data, connection) {
  console.log('encrypting data:', data)
  data = transformKeys(data,
      ['participant', 'participants'],
      crypto.decrypt)
  /* data = json_transform(data, 'participants', function(ps){return _.map(ps, crypto.decrypt)});- */
  winston.log('info', 'data decrypted:', data)
  return data
}

module.exports = {
  encryptParticipantFilter: encryptParticipantFilter
}
