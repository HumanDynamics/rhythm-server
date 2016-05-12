'use strict'

const winston = require('winston')

function saveMicrophoneMuteEvent(event) {
  winston.log('info', 'Microphone Mute event:', event)
}

module.exports.configure = function (socket, app) {
  socket.on('microphoneMute', function (data) {
    saveMicrophoneMuteEvent(data)
  })
}
