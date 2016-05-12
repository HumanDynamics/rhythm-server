'use strict'

const winston = require('winston')

function saveMicrophoneMuteEvent(socket, app) {
  socket.on('microphoneMute', function (data) {
    app.service('meetingEvents').create({
      meeting: data.meetingId,
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
