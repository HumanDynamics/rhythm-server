'use strict'

// Any filters that are shared across services are here
// decrypts data being sent out to users on service events.

const winston = require('winston')
const helpers = require('../helpers')
const transformKeys = helpers.transformKeys
const crypto = helpers.crypto

function decryptParticipantFilter (data, connection) {
  console.log('decrypting data:', data)
  data = transformKeys(data,
      ['participant', 'participants'],
      crypto.decrypt)
  /* data = json_transform(data, 'participants', function(ps){return _.map(ps, crypto.decrypt)});- */
  console.log('data decrypted:', data)
  winston.log('info', 'data decrypted:', data)
  return data
}

module.exports = {
  decryptParticipantFilter: decryptParticipantFilter
}
