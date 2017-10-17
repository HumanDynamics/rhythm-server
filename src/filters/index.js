'use strict'

// Any filters that are shared across services are here

const winston = require('winston')
const helpers = require('../helpers')
const transformKeys = helpers.transformKeys


function authenticationFilter (data, connection) {
  winston.log('info', 'auth filter, data:', data, connection.user)
  if (!connection.user) {
    winston.log('info', 'User not authenticated.', connection.user)
    return false
  }
  return data
}

module.exports = {
  authenticationFilter: authenticationFilter
}
