'use strict'

const winston = require('winston')

function saveCameraMuteEvent(event) {
  winston.log('info', 'Camera Mute event:', event)
}

module.exports.configure = function (socket, app) {
  socket.on('cameraMute', function (data) {
    saveCameraMuteEvent(data);
  })
}
