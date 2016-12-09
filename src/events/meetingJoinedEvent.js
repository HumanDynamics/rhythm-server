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
  console.log('getOrCreateMeeting', obj)
  var data = obj.data
  var app = obj.app
  var participantIds = _.pluck(data.participants, 'participant')
  console.log('participantIds', participantIds)
  var meta = (_.has(data, 'meta') && data.meta !== undefined) ? data.meta : '{}'
  app.service('meetings').get(data.meeting)
               .then((meeting) => {
                 console.log('patching meeting', meeting)
                 console.log('adding participants to that meeting', participantIds)
                 return app.service('meetings').patch(meeting._id, {
                   participants: _.uniq(meeting.participants.concat(participantIds))
                 }).then((meeting) => {
                   console.log('updated meeting with participants', meeting)
                   return meeting
                 })
               }).catch((err) => {
                 // no meeting found
                 winston.log('info', 'no meeting found', data, err)
                 return app.service('meetings').create({
                   _id: data.meeting,
                   participants: participantIds,
                   active: true,
                   meetingUrl: data.meetingUrl,
                   meta: JSON.parse(meta)
                 }).then((meeting) => {
                   console.log('new meeting with participants', meeting)
                   return meeting
                 }).catch((err) => {
                   winston.log('info', 'couldnt create new meeting', err)
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
