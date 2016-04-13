// events/index.js - custom events

'use strict'

const winston = require('winston')
const turnJob = require('../jobs').turnJob

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

    // if we now only have one participant, then the hangout started again
    if (data.hangout_participants.length === 1) {
      winston.log('info', 'only have one participant now, re-computing talk times...')

      app.service('meeting').patch(data.meeting, {
        active: true
      })

      app.service('meetingEvents').create({
        meeting: data.meeting,
        event: 'start',
        timestamp: new Date()
      })

      turnJob.startJob(data.meeting)
    }
  })
}

module.exports.configure = configure
