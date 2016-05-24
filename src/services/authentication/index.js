'use strict'

const winston = require('winston')
const authentication = require('feathers-authentication')

module.exports = function () {
  const app = this

  let config = app.get('auth')

  if (app.get('authOn')) {
    winston.log('info', 'configuring authentication...')
    app.configure(authentication(config))
  }
}
