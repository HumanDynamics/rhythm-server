var _ = require('underscore')
var winston = require('winston')

// wait 2 seconds to consider a meeting dead.
var waitingThreshold = 10 * 1000
// {meetingId: [{participant: <participantId>, timestamp: <timestamp>}, ...]
var heartbeats = {}
var heartbeatListener = null

// Returns true if the given heartbeat has timed out.
var checkHeartbeat = function (heartbeat) {
  var delta = (new Date()) - heartbeat.timestamp
  return (delta > waitingThreshold)
}

// checks a given list of heartbeats for timeouts. If all hearbeats have
// timed out, then set the associated meeting to inactive.
// If only some participants have timed out, remove them from the meeting in the DB,
// and stop their heartbeats.
var checkHeartbeats = function (meeting, socket, app) {
  var timedOuts = _.map(heartbeats[meeting], checkHeartbeat)
  if (_.every(timedOuts)) {
    app.service('meetings').patch(meeting, {
      participants: []
    }).then((meetingObj) => {
      delete heartbeats[meetingObj._id]
    }).catch((err) => {
      winston.log('info', 'Unable to stop heartbeat for meeting', err)
    })
  } else if (_.some(timedOuts)) {
    var participantsToRemove = []
    _.each(heartbeats[meeting], (heartbeat, index) => {
      if (timedOuts[index] === true) {
        participantsToRemove.push(heartbeats[meeting][index].participant)
      }
    })

    app.service('meetings').patch(meeting, {}, {
      remove_participants: participantsToRemove
    }).then(function (meeting) {
      _.each(participantsToRemove, function (participant) {
        if (!_.contains(meeting.participants, participant)) {
          stopHeartbeat({
            meeting: meeting,
            participant: participant
          })
        }
      })
    })
  } else {
    return
  }
}

// checks all meetings / heartbeats for timeouts.
// if all heartbeats for a meeting have timed out, set it as inactive
// and remove it from the checker.
var checkAllHeartbeats = function (socket, app) {
  _.each(_.keys(heartbeats), (heartbeat) => {
    checkHeartbeats(heartbeat, socket, app)
  })
}

// removes all heartbeat records that match the given meeting ID and participant
// ID in the heartbeat.
var stopHeartbeat = function (heartbeat) {
  winston.log('info', 'Stopping heartbeat for meeting:', heartbeat.meeting)
  heartbeats[heartbeat.meeting] = _.filter(heartbeats[heartbeat.meeting], function (obj) {
    return obj.participant !== heartbeat.participant
  })
}

var maybeAddParticipantToMeeting = function (meeting, participant) {
  app.service('meetings').patch(meeting, {}, {
    add_participant: participant
  }).then(function (meeting) {
    winston.log('info', 'added participant to meeting:', meeting)
  })
}

// Either creates a new heartbeat record, or updates an existing one with a
// revised timestamp.
// TODO: If we receive a heartbeat from a meeting that is marked as inactive,
// mark it as active.
var updateHeartbeat = function (heartbeat) {
  _.each(heartbeats[heartbeat.meeting], function (obj) {
    if (obj.participant === heartbeat.participant) {
      obj.timestamp = new Date()
      return
    }
  })
  // if we're here, we didn't find a matching heartbeat. make a new one.
  var hbObj = _.extend(heartbeat, {'timestamp': new Date()})
  if (_.has(heartbeats, heartbeat.meeting)) {
    heartbeats[heartbeat.meeting].push(hbObj)
  } else {
    heartbeats[heartbeat.meeting] = [hbObj]
  }
  maybeAddParticipantToMeeting(heartbeat.meeting, heartbeat.participant)
  return
}

function listenHeartbeats (socket, app) {
  socket.on('heartbeat-start', updateHeartbeat)
  socket.on('heartbeat-stop', stopHeartbeat)
  heartbeatListener = setInterval(() => {
    checkAllHeartbeats(socket, app)
  }, 1000)
}

function stopListening (socket) {
  clearInterval(heartbeatListener)
}

module.exports.configure = function (socket, app) {
  listenHeartbeats(socket, app)
}

module.exports.disable = function (socket, app) {
  stopListening(socket)
}
