'use strict'

const service = require('feathers-mongoose')
const utteranceDistribution = require('./utteranceDistribution-model')
const hooks = require('./hooks')

module.exports = function () {
  const app = this

  const options = {
    Model: utteranceDistribution,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use('/utteranceDistributions', service(options))

  // Get our service so that we can bind hooks
  const utteranceDistributionService = app.service('/utteranceDistributions')

  // Set up our hooks
  utteranceDistributionService.hooks(hooks)
}
