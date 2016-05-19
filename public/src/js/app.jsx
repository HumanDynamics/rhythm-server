import React from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { Router, Route, browserHistory } from 'react-router'
import {Nav, Home} from './components/components'
import MeetingTable from './components/meetingList'
import MeetingSummary from './components/meeting/meetingSummary'
import MeetingListAPIUtils from './api/MeetingAPIUtils'
import ParticipantAPIUtils from './api/ParticipantAPIUtils'
import TurnAPIUtils from './api/TurnAPIUtils'

const App = React.createClass({
  render () {
    return (
      <div>
        <Nav/>
          {this.props.children}
      </div>
    )
  }
})

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
    ReactDOM.render(
      <Router history={browserHistory}>
          <Route path='/' component={App}>
            <Route path='meetings' component={MeetingTable}/>
            <Route path='meeting/:meetingId' component={MeetingSummary}/>
        </Route>
      </Router>,
      mountNode
    )

    MeetingListAPIUtils.getAllMeetings()
    MeetingListAPIUtils.registerCreatedCallback()
    MeetingListAPIUtils.registerChangedCallback()

    ParticipantAPIUtils.getAllParticipants()
    ParticipantAPIUtils.registerCreatedCallback()
    ParticipantAPIUtils.registerChangedCallback()

    TurnAPIUtils.registerCreatedCallback()
  }
}

app.initialize()
