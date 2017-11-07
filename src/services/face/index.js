'use strict'

const service = require('feathers-mongoose')
const face = require('./face-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: face
  }

  // Initialize our service with any options it requires
  app.use('/faces', service(options))

  // Get our initialize service to that we can bind hooks
  const faceService = app.service('/faces')

  // Set up our before hooks
  faceService.before(hooks.before)

  // Set up our after hooks
  faceService.after(hooks.after)

  faceService.filter(globalFilters.authenticationFilter)
}
