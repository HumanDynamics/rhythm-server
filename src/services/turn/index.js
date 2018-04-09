'use strict'

const service = require('feathers-mongoose')
const turn = require('./turn-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: turn
  }

  // Initialize our service with any options it requires
  app.use('/turns', service(options))

  // Get our service so that we can bind hooks
  const turnService = app.service('/turns')

  // Set up our hooks
  turnService.hooks(hooks)

  turnService.filter(globalFilters.authenticationFilter)
}
