// meetingJoinedEvent.js -- listener for meetingJoined events

'use strict'

const winston = require('winston')

function getOrCreateParticipant (data, app) {
  return app.service('participants').get(data.participant)
            .then((participant) => {
              // participant already exists
              return app.service('participants')
                        .patch(participant._id, {
                          meetings: participant.meetings.concat([data.meeting])
                        }).then(() => {
                          return {data: data, app: app}
                        })
            }).catch((err) => {
              winston.log('info', 'creating a new participant:', err)
              app.service('participants').create({
                _id: data.participant,
                name: data.name,
                consent: data.consent || false,
                locale: data.locale,
                consentDate: data.consentDate || null
              }).then((participant) => {
                winston.log('info', 'created a new participant', participant)
                return {data: data, app: app}
              })
            })
}

function getOrCreateMeeting (obj) {
  var data = obj.data
  var app = obj.app
  return app.service('meetings').get(data.meeting)
            .then((meeting) => {
              app.service('meetings').patch(meeting._id, {
                participants: data.participants
              }).then((meeting) => {
                return meeting
              })
            }).catch((err) => {
              // no meeting found
              winston.log('info', 'no meeting found', err)
              app.service('meetings').create({
                _id: data.meeting,
                participants: data.participants,
                active: true
              }).then((meeting) => {
                return meeting
              })
            })
}

module.exports.configure = function (socket, app) {
  socket.on('meetingJoined', function (data) {
    winston.log('info', 'meeting joined event:', data)
    return getOrCreateParticipant(data, app)
    .then(getOrCreateMeeting)
  })
}
