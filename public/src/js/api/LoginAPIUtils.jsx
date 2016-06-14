import LoginActionCreators from '../actions/LoginActionCreators'
import AppDispatcher from '../dispatcher/dispatcher'
import LoginConstants from '../constants/LoginConstants'

import io from 'socket.io-client'
import feathers from 'feathers-client'

var ActionTypes = LoginConstants.ActionTypes

var socket = io.connect('localhost:3000', {'transports': [
  'websocket',
  'flashsocket',
  'jsonp-polling',
  'xhr-polling',
  'htmlfile'
]})

// ActionTypes.USER_LOGGED_IN 
