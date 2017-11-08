// meetingJoinedEvent.js -- listener for meetingJoined events

'use strict'

const winston = require('winston')
const _ = require('underscore')

function getOrCreateParticipant (data, app) {
  return app.service('participants').get(data.participant)
    .then((participant) => {
      // participant already exists
      return app.service('participants')
        .patch(participant._id, {
          meetings: _.uniq(participant.meetings.concat([data.meeting]))
        }).then(() => {
          return {data: data, app: app}
        })
    }).catch((err) => {
      winston.log('info', 'creating a new participant...', err)
      return app.service('participants').create({
        _id: data.participant,
        name: data.name,
        email: data.email,
        consent: data.consent || false,
        locale: data.locale,
        consentDate: data.consentDate || null,
        meetings: [data.meeting]
      }).then((participant) => {
        winston.log('info', 'created a new participant', participant)
        return {data: data, app: app}
      }).catch((err) => {
        winston.log('info', 'couldnt make a new participant', err)
        return {data: data, app: app}
      })
    })
}

function getOrCreateMeeting (obj) {
  winston.log('info', 'getting or creating a meeting...')
  winston.log('info', 'getOrCreateMeeting', obj)
  var data = obj.data
  var app = obj.app
  var participantIds = _.pluck(data.participants, 'participant')
  winston.info('info', 'participantIds: ', participantIds)
  winston.log('info', 'meeting meta: ', data.meta)
  var meta = (_.has(data, 'meta') && data.meta !== undefined) ? data.meta : '{}'
  // query for active meetings that match the given room name
  // OR if not provided room name, use id
  let query = data.room !== undefined ? { room: data.room, active: true } : { _id: data.meeting }

  app.service('meetings').find({ query: query })
    .then((meetings) => {
      if (meetings.length > 1) {
        winston.log('error', 'found multiple active meetings for room ', data.room)
      }
      let meeting = meeting[0]
      winston.log('info', 'patching meeting: ', meeting)
      winston.log('info', 'adding participants to that meeting: ', participantIds)
      return app.service('meetings').patch(meeting._id, {
        participants: _.uniq(meeting.participants.concat(participantIds))
      }).then((meeting) => {
        winston.log('info', 'updated meeting with participants: ', meeting)
        return meeting
      })
    }).catch((err) => {
      // no active meeting found
      winston.log('info', 'no meeting found', data, err)
      // get the number of meetings for this group
      // this only executes if a meetings is found
      app.service('meetings').find({ query: { room: data.room } }).then((mtgs) => {
        // generate an id for the room
        let id = data.room + '-' + (mtgs.length + 1)
        return app.service('meetings').create({
          _id: id,
          participants: participantIds,
          room: data.room,
          active: true,
          meetingUrl: data.meetingUrl,
          meta: JSON.parse(meta)
        }).then((meeting) => {
          winston.log('info', 'new meeting with participants', meeting)
          return meeting
        }).catch((err) => {
          winston.log('error', 'couldnt create new meeting', err)
          return err
        })
      })
    })
}

module.exports.configure = function (socket, app) {
  socket.on('meetingJoined', function (data) {
    winston.log('info', 'meeting joined event:', data)
    return getOrCreateParticipant(data, app)
    .then(getOrCreateMeeting)
    .catch((err) => {
      winston.log('info', 'unable to handle successfully: ', err)
    })
  })
}
