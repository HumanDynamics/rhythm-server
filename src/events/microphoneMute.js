'use strict'

const winston = require('winston')

var app;
var socket;

function saveMicrophoneMuteEvent() {
  socket.on('microphoneMute', function (data) {
    winston.log('info', 'Microphone Mute event:', event);

    app.service('meetingEvents').create({
      meetingId: data.meetingId,
      event: 'microphoneMute',
      data: {
        isMicrophoneMute: data.isMicrophoneMute,
        participantId: data.participantId
      }
      timestamp: new Date()
    })
  })
}

module.exports.configure = function (socket, app) {
  app = app;
  socket = socket;

  saveMicrophoneMuteEvent();
}
