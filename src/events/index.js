// events/index.js - custom events

'use strict'

const winston = require('winston')
const meetingJoinedEvent = require('./meetingJoinedEvent')
const heartbeat = require('./heartbeat')

function configure (socket, app) {
  winston.log('info', 'registering socketio custom events.')
  meetingJoinedEvent.configure(socket, app)
  heartbeat.configure(socket, app)
}

module.exports.configure = configure
