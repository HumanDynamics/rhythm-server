// events/index.js - custom events

'use strict'

const winston = require('winston')

function configure (socket, app) {
  winston.log('info', 'registering socketio custom events.')

  socket.on('meetingJoined', function (data) {
    app.service('participants').get(data.participant)
       .then((participant) => {
         // participant already exists
         app.service('participants')
                .patch(participant._id, {
                  meetings: participant.meetings.concat([data.meeting])
                })
       }).catch((err) => {
         // new participant
         winston.log('info', 'creating a new participant:', err)
         app.service('participants').create({
           _id: data.participant,
           name: data.name,
           consent: data.consent || false,
           consentDate: data.consentDate || null
         })
       })
    // check for the meeting, create one if we need to
    app.service('meetings').get(data.meeting)
       .then((meeting) => {
         // found meeting
         app.service('meetings').patch(meeting._id, {
           participants: data.participants
         })
       }).catch((err) => {
         // no meeting
         winston.log('info', 'creating a new meeting:', err)
         app.service('meetings').create({
           _id: data.meeting,
           participants: data.participants,
           active: true
         })
       })
  })
}

module.exports.configure = configure
