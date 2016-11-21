// add-participant-hook.js
// if there is an 'add_participants' query parameter in a `patch`
// request with an associated list of participant IDs, it adds those
// participants to the meeting

'use strict'
const _ = require('underscore')
const winston = require('winston')

module.exports = function (hook) {
  if (hook.data.participants) {
    winston.log('info', 'adding participant:', hook.data.participants)
    return hook.app.service('meetings').get(hook.id)
        .then((meeting) => {
          var oldParticipants = meeting.participants
          if (_.contains(oldParticipants, hook.data.participants)) {
            return hook
          } else {
            hook.data.participants = _.union(oldParticipants, hook.data.participants)
            // delete hook.data.participants
            return hook
          }
        }).catch((err) => {
          winston.log('error', 'couldnt add given participant', err)
          return hook
        })
  } else {
    winston.log('info', 'not adding participant:', hook.data, hook.id)
    return hook
  }
}
