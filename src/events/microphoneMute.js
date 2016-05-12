'use strict'

const winston = require('winston')

function saveMicrophoneMuteEvent(socket, app) {
  socket.on('microphoneMute', function (data) {
    winston.log('info', 'Microphone Mute event:', data);

    app.service('meetingEvents').create({
      meetingId: data.meetingId,
      event: 'microphoneMute',
      data: {
        isMicrophoneMute: data.isMicrophoneMute,
        participantId: data.participantId
      },
      timestamp: new Date()
    })
  })
}

module.exports.configure = function (socket, app) {
  saveMicrophoneMuteEvent(socket, app);
}
