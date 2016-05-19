// meetingList.jsx

import React from 'react'
import update from 'react-addons-update'

import { Link } from 'react-router'

import {MeetingStore} from '../stores/meetingStore'
import {ParticipantStore} from '../stores/participantStore'
import MeetingActions from '../actions/MeetingActionCreators'

import Table from 'material-ui/lib/table/table'
import TableHeaderColumn from 'material-ui/lib/table/table-header-column'
import TableRow from 'material-ui/lib/table/table-row'
import TableHeader from 'material-ui/lib/table/table-header'
import TableRowColumn from 'material-ui/lib/table/table-row-column'
import TableBody from 'material-ui/lib/table/table-body'

import Colors from 'material-ui/lib/styles/colors'
import CheckCircle from 'material-ui/lib/svg-icons/action/check-circle'
import HighlightOff from 'material-ui/lib/svg-icons/action/highlight-off'
import Clear from 'material-ui/lib/svg-icons/content/clear'
import RaisedButton from 'material-ui/lib/raised-button'

class MeetingRow extends React.Component {
  constructor (props, context) {
    console.log('props:', props)
    super(props, context)
    this.handleClickClear = this.handleClickClear.bind(this)
  }

  getIcon (active) {
    if (active) {
      return (
        <CheckCircle color={Colors.green500} />
      )
    } else {
      return (
        <HighlightOff color={Colors.red500} />
      )
    }
  }

  handleClickClear (event) {
    MeetingActions.updateMeetingActive(this.props.meeting._id, false)
  }

  render () {
    return (
      <TableRow>
        <TableRowColumn><Link to={`/meeting/${this.props.meeting._id}`}>{this.props.meeting._id}</Link></TableRowColumn>
        <TableRowColumn>{this.getIcon(this.props.meeting.active)}</TableRowColumn>
        <TableRowColumn>
          <RaisedButton
            label='Set Inactive'
            icon={<Clear/>}
            onClick={this.handleClickClear}
            disabled={!this.props.meeting.active}
          />
        </TableRowColumn>
      </TableRow>
    )
  }
}

export default class MeetingTable extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.meetingsChanged = this.meetingsChanged.bind(this)
    this.participantsChanged = this.participantsChanged.bind(this)
    this.state = {
      meetings: MeetingStore.getAll(),
      participants: ParticipantStore.getParticipantsByMeeting()
    }
  }

  meetingsChanged () {
    this.setState({meetings: update(this.state.meetings,
                                    {$set: MeetingStore.getAll()})
    })
  }

  participantsChanged () {
    this.setState({participants: update(this.state.participants,
                                        {$set: ParticipantStore.getParticipantsByMeeting()})
    })
  }

  getParticipantFromMeeting (meeting_id) {
    return this.state.participants[meeting_id] || []
  }

  componentWillMount () {
  }

  componentDidMount () {
    MeetingStore.bind('change', this.meetingsChanged)
    ParticipantStore.bind('change', this.participantsChanged)
  }

  componentWillUnmount () {
    MeetingStore.unbind('change', this.meetingsChanged)
    ParticipantStore.unbind('change', this.participantsChanged)
  }

  render () {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>Meeting ID</TableHeaderColumn>
            <TableHeaderColumn>Active?</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
            {this.state.meetings.map((meeting, i) =>
              <MeetingRow
                meeting={meeting}
                participants={this.getParticipantFromMeeting(meeting._id)}
                key={meeting._id}
              />
             )}
        </TableBody>
      </Table>
  )
  }
}
