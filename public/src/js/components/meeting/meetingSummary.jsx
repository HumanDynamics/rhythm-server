import React from 'react'
import { MeetingStore } from '../../stores/meetingStore'
import { MeetingActions } from '../../actions/MeetingActionCreators'

export default class meetingSummary extends React.Component {
  constructor (props, context) {
    console.log('[meetingsummary] props:', props)
    super(props, context)
    this.state = {
      turns: MeetingStore.getTurn(this.props.params.meetingId)
    }
  }

  render () {
    return (
      <div>
        <h1>Meeting: {this.props.params.meetingId}</h1>
        <p>Turns: {this.state.turns.turns}</p>
      </div>
    )
  }
}
