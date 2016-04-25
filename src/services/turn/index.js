'use strict'

const service = require('feathers-mongoose')
const turn = require('./turn-model')
const hooks = require('./hooks')

module.exports = function () {
  const app = this

  const options = {
    Model: turn
  }

  // Initialize our service with any options it requires
  app.use('/turns', service(options))

  // Get our initialize service to that we can bind hooks
  const turnService = app.service('/turns')

  // Set up our before hooks
  turnService.before(hooks.before)

  // Set up our after hooks
  turnService.after(hooks.after)
}
