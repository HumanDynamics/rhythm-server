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

  // Get our service so that we can bind hooks
  const faceService = app.service('/faces')

  // Set up our hooks
  faceService.hooks(hooks)

  faceService.filter(globalFilters.authenticationFilter)
}
