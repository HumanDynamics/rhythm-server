'use strict'

function saveCameraMuteEvent (socket, app) {
  socket.on('cameraMute', function (data) {
    app.service('meetingEvents').create({
      meeting: data.meetingId,
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
  saveCameraMuteEvent(socket, app)
}
