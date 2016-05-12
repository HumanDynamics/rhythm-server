'use strict'

const winston = require('winston')

function saveCameraMuteEvent(socket, app) {
  socket.on('cameraMute', function (data) {
    winston.log('info', 'Camera Mute event:', data)

    app.service('meetingEvents').create({
      meetingId: data.meetingId,
      event: 'cameraMute',
      data: {
        isCameraMute: data.isCameraMute,
        participantId: data.participantId
      },
      timestamp: new Date()
    })
  })
}

module.exports.configure = function (socket, app) {
  saveCameraMuteEvent(socket, app);
}
