// deactivate-meeting-hook.js -- Before, patch. sets a meeting to inactive
// if it's going from n to 0 participant before a `patch` event
// will also:
// - generate meeting events for meeting ends
// - end turn computation when a meeting stops
'use strict'
const _ = require('underscore')

function shouldMakeMeetingInactive (newParticipants, meetingObject) {
  return (newParticipants.length === 0 &&
          meetingObject.participants.length > 0 &&
          meetingObject.active === true)
}

function createMeetingEndEvent (hook) {
  var meetingId = (hook.method === 'create') ? hook.data._id : hook.id
  return hook.app.service('meetingEvents').create({
    meeting: meetingId,
    event: 'end',
    timestamp: new Date()
  }).then((meetingEvent) => {
    return hook
  })
}

module.exports = function (hook) {
  if (!_.has(hook.data, 'participants')) {
    return hook
  } else {
    return hook.app.service('meetings').get(hook.id)
               .then((meeting) => {
                 if (shouldMakeMeetingInactive(hook.data.participants, meeting)) {
                   hook.data.active = false
                   hook.data.endTime = new Date()
                   return createMeetingEndEvent(hook)
                 }
                 return hook
               })
  }
}
