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
            meeting: meeting._id,
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
  winston.log('info', 'Stopping heartbeat for meeting:', heartbeat.meeting, heartbeat.participant)
  heartbeats[heartbeat.meeting] = _.filter(heartbeats[heartbeat.meeting], function (obj) {
    return obj.participant !== heartbeat.participant
  })
  winston.log('info', 'Stopped heartbeat:', heartbeats[heartbeats.meeting])
}

var maybeAddParticipantToMeeting = function (meeting, participant, app) {
  app.service('meetings').get(meeting)
     .then((meeting) => {
       if (_.contains(meeting.participants, participant)) {
         return false
       } else {
         return true
       }
     }).then((shouldAdd) => {
       if (shouldAdd) {
         app.service('meetings').patch(meeting, {}, {
           add_participant: participant
         }).then((meeting) => {
           winston.log('info', 'added participant to meeting:', meeting)
         })
       }
     }).catch((err) => {
       winston.log('error', 'Couldnt get meeting participants or couldnt add participant:', err)
     })
}

// Either creates a new heartbeat record, or updates an existing one with a
// revised timestamp.
// TODO: If we receive a heartbeat from a meeting that is marked as inactive,
// mark it as active.
var updateHeartbeat = function (app) {
  return function (heartbeat) {
    var hbObj = _.extend(heartbeat, {'timestamp': new Date()})
    var foundHeartbeat = false
//    winston.log('info', 'received heartbeat:', heartbeats)

    if (_.has(heartbeats, heartbeat.meeting)) {
      _.each(heartbeats[heartbeat.meeting], function (obj) {
        // winston.log('info', 'current meeting:', heartbeats[heartbeat.meeting])
        if (obj.participant === heartbeat.participant) {
          // winston.log('info', 'updated heartbeat:', obj.participant, heartbeat.participant)
          obj.timestamp = new Date()
          foundHeartbeat = true
          return
        }
      })
      
      if (!foundHeartbeat) {
        // if we're here, we didn't find a matching participant in the meeting
        winston.log('info', 'pushing new heartbeat...')
        heartbeats[heartbeat.meeting].push(hbObj)
        maybeAddParticipantToMeeting(heartbeat.meeting, heartbeat.participant, app)
        }
    } else {
      winston.log('info', 'no heartbeat for meeting, updating...')
      // no heartbeats for that meeting
      heartbeats[heartbeat.meeting] = [hbObj]
      maybeAddParticipantToMeeting(heartbeat.meeting, heartbeat.participant, app)
    }
  }
}

function listenHeartbeats (socket, app) {
  socket.on('heartbeat-start', updateHeartbeat(app))
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
