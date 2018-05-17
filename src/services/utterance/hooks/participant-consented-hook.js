// participant-consented-hook.js -- don't store speaking data if
// the participant hasn't consented.
'use strict'

const winston = require('winston')

module.exports = function (hook) {
  return hook.app.service('participants')
    .get(hook.data.participant)
    .then((participant) => {
      if (participant.consent === true) {
        return hook
      } else {
        winston.log('info', 'NOT creating utterance, do not have consent')
        hook.result = { created: false }
      }
    })
    .catch((err) => {
      winston.log('info', 'Unable to create utterance, participant does not exist yet', err)
      hook.result = { created: false }
    })
}
