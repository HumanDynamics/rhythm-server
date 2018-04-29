// participants-changed-hook.js -- After, patch & create. if a patch event
// changes participants in this hangout, records the new value in a
// participantEvent

'use strict'
const _ = require('underscore')
const winston = require('winston')

module.exports = function (hook) {
  if (_.has(hook.data, 'participants')) {
    hook.app.service('participantEvents')
      .create({
        meeting: hook.result._id,
        participants: hook.result.participants,
        timestamp: new Date()
      })
      .then((participantEvent) => {
        winston.log('info', 'created participantEvent!')
        return hook
      })
      .catch(function (err) {
        winston.log('info', 'error creating participantEvent!', err)
        return hook
      })
  } else {
    winston.log('info', 'no participants in request, not creating event...')
    return hook
  }
}
