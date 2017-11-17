'use strict'

// Any filters that are shared across services are here

const winston = require('winston')

function authenticationFilter (data, connection) {
  if (!connection.user) {
    winston.log('info', 'User not authenticated.', connection.user)
    return false
  }
  return data
}

module.exports = {
  authenticationFilter: authenticationFilter
}
