import MeetingActionCreators from '../actions/MeetingActionCreators'
import io from 'socket.io-client'
import feathers from 'feathers-client'

var socket = io.connect('localhost:3000', {'transports': [
  'websocket',
  'flashsocket',
  'jsonp-polling',
  'xhr-polling',
  'htmlfile'
]})

var app = feathers().configure(feathers.socketio(socket))

var turns = app.service('turns')

function registerCreatedCallback () {
  turns.on('created', function (turn) {
    MeetingActionCreators.updateTurns(turn, turn.meeting)
  })
}

module.exports = {
  registerCreatedCallback: registerCreatedCallback
}
