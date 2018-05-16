'use strict'

const service = require('feathers-mongoose')
const meetingEvent = require('./meetingEvent-model')
const hooks = require('./hooks')

module.exports = function () {
  const app = this

  const options = {
    Model: meetingEvent
    /* paginate: {o
       default: 5,
       max: 25
       } */
  }

  // Initialize our service with any options it requires
  app.use('/meetingEvents', service(options))

  // Get our service so that we can bind hooks
  const meetingEventService = app.service('/meetingEvents')

  // Set up our hooks
  meetingEventService.hooks(hooks)
}
