// activate-meeting-hook.js -- before, patch & create. sets a meeting
// to active if it's going from 0 to 1 participant before a `patch`
// event, or if a meeting is being created.
// will also:
// - generate meeting events for meeting starts
'use strict'
const _ = require('underscore')

function shouldMakeMeetingActive (newParticipants, meetingObject) {
  return (newParticipants.length === 1 &&
          meetingObject.participants.length === 0 &&
          meetingObject.active === false)
}

function createMeetingStartEvent (hook) {
  var meetingId = (hook.method === 'create') ? hook.data._id : hook.id
  return hook.app.service('meetingEvents').create({
    meeting: meetingId,
    event: 'start',
    timestamp: new Date()
  }).then((meetingEvent) => {
    return hook
  })
}

module.exports = function (hook) {
  if (hook.method === 'create') {
    return createMeetingStartEvent(hook)
  } else {
    if (!_.has(hook.data, 'participants')) {
      return hook
    } else {
      return hook.app.service('meetings').get(hook.id)
                 .then((meeting) => {
                   if (shouldMakeMeetingActive(hook.data.participants, meeting)) {
                     hook.data.active = true
                     hook.data.endTime = null
                     return createMeetingStartEvent(hook)
                   }
                   return hook
                 })
    }
  }
}
