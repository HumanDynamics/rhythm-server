// participants-changed-hook.js -- After, patch & create. if a patch event
// changes participants in this hangout, records the new value in a
// participantEvent

'use strict'
const _ = require('underscore')

module.exports = function (hook) {
  if (_.has(hook.data, 'participants')) {
    hook.app.service('participantEvents').create({
      meeting: hook.result._id,
      participants: hook.result.participants,
      timestamp: new Date()
    }).then((participantEvent) => {
      return hook
    })
  } else {
    return hook
  }
}
