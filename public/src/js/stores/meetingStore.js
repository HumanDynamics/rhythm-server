import _ from 'underscore'
import MicroEvent from 'microevent'

import AppDispatcher from '../dispatcher/dispatcher'
import MeetingConstants from '../constants/MeetingConstants'

var ActionTypes = MeetingConstants.ActionTypes
var CHANGE_EVENT = 'change'

class _MeetingStore {
  constructor () {
    this.meetings = {}
  }

  getAll () {
    var meetings = (_.values(this.meetings) || [])
    return _.sortBy(meetings, function (h) {
      return h.start_time
    }).reverse()
    //        return this.meetings
  }

  get (id) {
    return this.meetings[id]
  }

  getTurn (id) {
    return this.meetings[id].turn
  }
}

MicroEvent.mixin(_MeetingStore)

var MeetingStore = new _MeetingStore()

function _replaceMeeting (meeting) {
  if (_.has(MeetingStore.meetings, meeting._id)) {
    MeetingStore.meetings[meeting._id] = meeting
  }
}

function _addMeeting (meeting) {
  if (!_.has(MeetingStore.meetings, meeting._id)) {
    MeetingStore.meetings[meeting._id] = meeting
  }
}

function _addMeetings (meetings) {
  _.each(meetings, function (meeting) {
    _addMeeting(meeting)
  })
}

function _changeMeetingActive (meeting_id, active) {
  if (_.has(MeetingStore.meetings, meeting_id)) {
    MeetingStore.meetings[meeting_id].active = active
  }
}

function _updateTurn (turn, meeting_id) {
  console.log('turns for meeting:', turn, meeting_id)
  MeetingStore.meetings[meeting_id].turn = turn
}

AppDispatcher.register(function (payload) {
  switch (payload.type) {
    case ActionTypes.RECEIVE_ALL_MEETINGS:
      _addMeetings(payload.meetings)
      MeetingStore.trigger(CHANGE_EVENT)
      break
    case ActionTypes.RECEIVE_NEW_MEETING:
      _addMeeting(payload.meeting)
      MeetingStore.trigger(CHANGE_EVENT)
      break
    case ActionTypes.RECEIVE_CHANGED_MEETING:
      _replaceMeeting(payload.meeting)
      MeetingStore.trigger(CHANGE_EVENT)
      break
    case ActionTypes.UPDATE_MEETING_ACTIVE:
      _changeMeetingActive(payload.meeting_id, payload.active)
      break
    case ActionTypes.UPDATE_MEETING_TURNS:
      _updateTurn(payload.turn, payload.meeting)
      MeetingStore.trigger(CHANGE_EVENT)
      break
    default:
  }
  return true
})

exports.MeetingStore = MeetingStore
