'use strict'

const winston = require('winston')

var app;
var socket;

function saveCameraMuteEvent() {
  socket.on('cameraMute', function (data) {
    winston.log('info', 'Camera Mute event:', event)

    app.service('meetingEvents').create({
      meetingId: data.meetingId,
      event: 'cameraMute',
      data: {
        isCameraMute: data.isCameraMute,
        participantId: data.participantId
      }
      timestamp: new Date()
    })
  })
}

module.exports.configure = function (socket, app) {
  app = app;
  socket = socket;

  saveCameraMuteEvent();
}
