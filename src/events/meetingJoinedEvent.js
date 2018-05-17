// meetingJoinedEvent.js -- listener for meetingJoined events

'use strict'

const winston = require('winston')
const _ = require('underscore')

function addParticipantToMeeting (app, participant, meeting) {
  return app.service('meetings')
    .get(meeting)
    .then((meeting) => {
      // now patch the meeting to include the participant
      winston.log('info', 'patching meeting: ', meeting)
      winston.log('info', 'adding participant to meeting: ', participant._id)
      var parts = meeting.participants || []
      return app.service('meetings')
        .patch(meeting, { participants: _.uniq(parts.concat([ participant._id ])) })
        .then((meeting) => {
          winston.log('info', 'updated meeting with participants: ', meeting)
          return meeting
        })
    })
}

function getOrCreateParticipant (obj) {
  var data = obj.data
  var app = obj.app

  return app.service('participants').get(data.participant)
    .then((participant) => {
      // participant already exists
      let email = participant.email || data.participant.email
      return app.service('participants')
        .patch(participant._id, {
          meetings: _.uniq(participant.meetings.concat([ data.meeting ])),
          email: email
        })
        .then((participant) => {
          return addParticipantToMeeting(app, participant, data.meeting)
        })
    })
    .catch((err) => {
      winston.log('info', 'creating a new participant...', err)
      return app.service('participants')
        .create({
          _id: data.participant,
          name: data.name,
          email: data.email,
          consent: data.consent || false,
          consentDate: data.consentDate || null,
          meetings: [ data.meeting ]
        })
        .then((participant) => {
          winston.log('info', 'created a new participant', participant._id)
          return addParticipantToMeeting(app, participant, data.meeting)
        })
        .catch((err) => {
          winston.log('info', 'couldnt make a new participant', err)
          return err
        })
    })
}

function getOrCreateMeeting (data, app) {
  winston.log('info', 'getting or creating a meeting...')
  winston.log('info', 'meeting meta: ', data.meta)
  var meta = (_.has(data, 'meta') && data.meta !== undefined) ? data.meta : '{}'
  // query for active meetings that match the given room name
  // OR if not provided room name, use id
  let query = data.room !== undefined ? { room: data.room, active: true } : { _id: data.meeting }

  return app.service('meetings').find({ query: query })
    .then((meetings) => {
      if (meetings.length > 1) {
        winston.log('error', 'found multiple active meetings for room ', data.room)
      }

      if (meetings.length > 0) {
        // if the meeting already exists, just pass it along
        winston.log('info', 'meeting exists')
        var meeting = meetings[0]
        data.meeting = meeting._id
        return { data: data, app: app }
      } else {
        // no active meeting found
        winston.log('info', 'no meeting found', data)
        winston.log('info', 'creating meeting')
        // get the number of meetings for this group
        return app.service('meetings').find({ query: { room: data.room } })
          .then((mtgs) => {
            // generate an id for the new meeting based on room
            let id = data.room + '-' + (mtgs.length + 1)
            return app.service('meetings').create({
              _id: id,
              room: data.room,
              active: true,
              meetingUrl: data.meetingUrl,
              meta: JSON.parse(meta)
            })
            .then((meeting) => {
              winston.log('info', 'new meeting created', meeting._id)
              data.meeting = meeting._id
              return { data: data, app: app }
            })
            .catch((err) => {
              winston.log('error', 'couldnt create new meeting', err)
              return err
            })
          })
      }
    })
}

module.exports.configure = function (socket, app) {
  socket.on('meetingJoined', function (data) {
    winston.log('info', 'meeting joined event:', data)
    return getOrCreateMeeting(data, app)
    .then(getOrCreateParticipant)
    .catch((err) => {
      winston.log('info', 'unable to handle successfully: ', err)
    })
  })
}
