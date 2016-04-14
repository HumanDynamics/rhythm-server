// events/index.js - custom events

'use strict'

const winston = require('winston')
const meetingJoinedEvent = require('./meetingJoinedEvent')

function configure (socket, app) {
  winston.log('info', 'registering socketio custom events.')
  meetingJoinedEvent.configure(socket, app)
}

module.exports.configure = configure
