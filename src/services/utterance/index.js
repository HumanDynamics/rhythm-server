'use strict'

const service = require('feathers-mongoose')
const utterance = require('./utterance-model')
const hooks = require('./hooks')

module.exports = function () {
  const app = this          // eslint-disable-line consistent-this

  const options = {
    Model: utterance
  }

  // Initialize our service with any options it requires
  app.use('/utterances', service(options))

  // Get our service so that we can bind hooks
  const utteranceService = app.service('/utterances')

  // Set up our hooks
  utteranceService.hooks(hooks)
}
