// events/index.js - custom events

'use strict'

const winston = require('winston')
const meetingJoinedEvent = require('./meetingJoinedEvent')
const cameraMute = require('./cameraMute')
const microphoneMute = require('./microphoneMute')

function configure (socket, app) {
  winston.log('info', 'registering socketio custom events.')
  meetingJoinedEvent.configure(socket, app)
  cameraMute.configure(socket, app)
  microphoneMute.configure(socket, app)
}

module.exports.configure = configure
