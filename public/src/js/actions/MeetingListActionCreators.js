import AppDispatcher from '../dispatcher/dispatcher'
import MeetingListConstants from '../constants/MeetingListConstants'
var ActionTypes = MeetingListConstants.ActionTypes

module.exports = {

  receiveAllMeetings: function (meetings) {
    console.log('dispatching receiveALlMeetings')
    AppDispatcher.dispatch({
      type: ActionTypes.RECEIVE_ALL_MEETINGS,
      meetings: meetings
    })
  },

  receiveNewMeeting: function (meeting) {
    AppDispatcher.dispatch({
      type: ActionTypes.RECEIVE_NEW_MEETING,
      meeting: meeting
    })
  },

  receiveChangedMeeting: function (meeting) {
    AppDispatcher.dispatch({
      type: ActionTypes.RECEIVE_CHANGED_MEETING,
      meeting: meeting
    })
  },

  updateMeetingActive: function (meetingDBId, active) {
    AppDispatcher.dispatch({
      type: ActionTypes.UPDATE_MEETING_ACTIVE,
      meetingDBId: meetingDBId,
      active: active
    })
  }
}
