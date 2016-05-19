import MeetingActionCreators from '../actions/MeetingActionCreators'
import AppDispatcher from '../dispatcher/dispatcher'
import MeetingConstants from '../constants/MeetingConstants'
import io from 'socket.io-client'
import feathers from 'feathers-client'
import _ from 'underscore'

var ActionTypes = MeetingConstants.ActionTypes

var socket = io.connect('localhost:3000', {'transports': [
  'websocket',
  'flashsocket',
  'jsonp-polling',
  'xhr-polling',
  'htmlfile'
]})

var app = feathers().configure(feathers.socketio(socket))

var meetings = app.service('meetings')
var turns = app.service('turns')

function updateMeetingActive (meeting, active) {
  meetings.patch(meeting, {'active': active}, {},
                 function (error, data) {
                   if (!error && data) {
                     console.log('Patched meeting active successfully')
                   }
                 })
}

// get all meetings from server
function getAllMeetings () {
  meetings.find({}).then((foundMeetings) => {
    console.log('[utils] received meetings:', foundMeetings, MeetingActionCreators)
    MeetingActionCreators.receiveAllMeetings(foundMeetings)
    return foundMeetings
  }).then((meetings) => {
    console.log('[utils] getting turns..:')
    _.each(meetings, function (meeting) {
      turns.find({
        meeting: meeting._id
      }).then((turns) => {
        if (turns !== undefined && turns.length > 0) {
          console.log('[apiutils] latest turn', turns)
          MeetingActionCreators.updateTurns(_.max(turns, (t) => new Date(t.timestamp)),
                                            meeting._id)
        } else {
          MeetingActionCreators.updateTurns([], meeting._id)
        }
      }).catch((err) => {
        console.log('[utils] caught error:', err)
      })
    })
  })
}

function registerCreatedCallback () {
  meetings.on('created', function (meeting) {
    console.log('[utils] new meeting created:', meeting)
    MeetingActionCreators.receiveNewMeeting(meeting)
  })
}

function registerChangedCallback () {
  meetings.on('patched', function (meeting) {
    MeetingActionCreators.receiveChangedMeeting(meeting)
  })
}

// Register Dispatcher for API events
AppDispatcher.register(function (payload) {
  switch (payload.type) {
    case ActionTypes.UPDATE_MEETING_ACTIVE:
      updateMeetingActive(payload.meetingDBId, payload.active)
  }
})

module.exports = {
  getAllMeetings: getAllMeetings,
  registerCreatedCallback: registerCreatedCallback,
  registerChangedCallback: registerChangedCallback,
  updateMeetingActive: updateMeetingActive
}
