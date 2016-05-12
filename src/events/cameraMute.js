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
    .then((message) => { winston.log('info', 'Event created', message) })
    .catch((err) => { winston.log('info', 'Could not create new meeting event', err) })
  })
}

module.exports.configure = function (socket, app) {
  saveCameraMuteEvent(socket, app);
}
