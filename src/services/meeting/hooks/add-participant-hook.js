// add-participant-hook.js
// if there is an 'add_participants' query parameter in a `patch`
// request with an associated list of participant IDs, it adds those
// participants to the meeting

'use strict'
const _ = require('underscore')
const winston = require('winston')

module.exports = function (hook) {
  if (hook.params.add_participant) {
    return hook.app.service('meetings').get(hook.id)
        .then((meeting) => {
          var oldParticipants = meeting.participants
          if (_.contains(oldParticipants, hook.data.participant)) {
            return hook
          } else {
            hook.data.participants = _.union(oldParticipants, [hook.params.add_participant])
            return hook
          }
        }).catch((err) => {
          winston.log('error', 'couldnt add given participant', err)
          return hook
        })
  } else {
    return hook
  }
}