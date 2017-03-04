'use strict';

const service = require('feathers-mongoose');
const frame = require('./frame-model');
const hooks = require('./hooks');
const globalFilters = require('../../filters')

module.exports = function() {
  const app = this;

  const options = {
    Model: frame,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/frames', service(options));

  // Get our initialize service to that we can bind hooks
  const frameService = app.service('/frames');

  // Set up our before hooks
  frameService.before(hooks.before);

  // Set up our after hooks
  frameService.after(hooks.after);
  frameService.filter(globalFilters.decryptParticipantFilter)
  frameService.filter(globalFilters.authenticationFilter)

};
