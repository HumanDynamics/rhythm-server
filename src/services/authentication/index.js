'use strict'

const winston = require('winston')
const authentication = require('@feathersjs/authentication')

module.exports = function () {
  const app = this

  let config = {
    idField: process.env.AUTH_ID_FIELD,
    token: {
      secret: process.env.AUTH_TOKEN_SECRET
    },
    expiresIn: process.env.AUTH_TOKEN_EXPIRESIN,
    local: {}
  }

  if (process.env.AUTH_ON) {
    winston.log('info', 'configuring authentication...')
    app.configure(authentication(config))
  }
}
