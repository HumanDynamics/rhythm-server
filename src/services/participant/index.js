'use strict'

const service = require('feathers-mongoose')
const participant = require('./participant-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    paginate: {
      default: 5,
      max: 1000
    },
    Model: participant
  }

  // Initialize our service with any options it requires
  app.use('/participants', service(options))

  // Get our service so that we can bind hooks
  const participantService = app.service('/participants')

  // Set up our hooks
  participantService.hooks(hooks)

  participantService.filter(globalFilters.authenticationFilter)
}
