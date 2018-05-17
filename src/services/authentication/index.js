'use strict'

const winston = require('winston')
const auth = require('@feathersjs/authentication')
const local = require('@feathersjs/authentication-local')
const jwt = require('@feathersjs/authentication-jwt')

module.exports = function () {
  const app = this          // eslint-disable-line consistent-this

  let config = {
    jwt: {},
    secret: process.env.AUTH_TOKEN_SECRET,
    expiresIn: process.env.AUTH_TOKEN_EXPIRESIN,
    local: {}
  }

  if (process.env.AUTH_ON) {
    winston.log('info', 'configuring authentication...')
    app.configure(auth(config))
      .configure(jwt())
      .configure(local())

    // Authenticate the user using the a JWT or
    // email/password strategy and if successful
    // return a new JWT access token.
    app.service('authentication').hooks({
      before: {
        create: [
          auth.hooks.authenticate([ 'jwt', 'local' ])
        ]
      }
    })
  }
}
