import MeetingListActionCreators from '../actions/MeetingListActionCreators'
import AppDispatcher from '../dispatcher/dispatcher'
import MeetingListConstants from '../constants/MeetingListConstants'
import io from 'socket.io-client'
import feathers from 'feathers-client'

var ActionTypes = MeetingListConstants.ActionTypes

var socket = io.connect('localhost:3000', {'transports': [
  'websocket',
  'flashsocket',
  'jsonp-polling',
  'xhr-polling',
  'htmlfile'
]})

var app = feathers().configure(feathers.socketio(socket))

var meetings = app.service('meetings')

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
  meetings.find({}, function (error, foundMeetings) {
    if (error) {
      throw error
    }
    console.log('[utils] received meetings:', foundMeetings, MeetingListActionCreators)
    MeetingListActionCreators.receiveAllMeetings(foundMeetings)
  })
}

function registerCreatedCallback () {
  meetings.on('created', function (meeting) {
    console.log('[utils] new meeting created:', meeting)
    MeetingListActionCreators.receiveNewMeeting(meeting)
  })
}

function registerChangedCallback () {
  meetings.on('patched', function (meeting) {
    MeetingListActionCreators.receiveChangedMeeting(meeting)
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
