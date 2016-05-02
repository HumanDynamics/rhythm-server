// remove-participant-hook.js
// if there is a 'remove_participants' query parameter in a `patch`
// request with an associated list of participant IDs, it removes those
// participants from the meeting.

'use strict'
const _ = require('underscore')
const winston = require('winston')

module.exports = function (hook) {
  if (hook.params.remove_participants) {
    return hook.app.service('meetings').get(hook.id)
        .then((meeting) => {
          var oldParticipants = meeting.participants
          hook.data.participants = _.difference(oldParticipants,
                                                hook.params.remove_participants)
          winston.log('info', '>>> new participants:', hook.data.participants, hook.data)
          return hook
        }).catch((err) => {
          winston.log('error', 'couldnt remove given participants', err)
          return hook
        })
  } else {
    return hook
  }
}
