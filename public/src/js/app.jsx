import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {Home} from './components/components'
import MeetingListAPIUtils from './api/MeetingListAPIUtils'
import ParticipantAPIUtils from './api/ParticipantAPIUtils'

const app = {
  initialize: function () {
    console.log('Trying to render main...')
    injectTapEventPlugin()
    document.addEventListener('deviceready', this.onDeviceReady, false)
    document.addEventListener('DOMContentLoaded', this.onDeviceReady, false)
  },

  onDeviceReady: function () {
    console.log('Device ready, will try to render main !')
    const mountNode = document.getElementById('reactAppContainer')
    ReactDOM.render(<Home/>, mountNode)
    MeetingListAPIUtils.getAllMeetings()
    MeetingListAPIUtils.registerCreatedCallback()
    MeetingListAPIUtils.registerChangedCallback()

    ParticipantAPIUtils.getAllParticipants()
    ParticipantAPIUtils.registerCreatedCallback()
    ParticipantAPIUtils.registerChangedCallback()
  }
}

app.initialize()
