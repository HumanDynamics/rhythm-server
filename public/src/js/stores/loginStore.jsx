import MicroEvent from 'microevent'
import AppDispatcher from '../dispatcher/dispatcher'
import LoginConstants from '../constants/LoginConstants'

var ActionTypes = LoginConstants.ActionTypes
var CHANGE_EVENT = 'change'

class _LoginStore {
  constructor () {
    this._user = null
    this._token = null
  }

  get user () {
    return this._user
  }

  get token () {
    return this._token
  }

  isLoggedIn () {
    return !!this._user
  }
}

MicroEvent.mixin(_LoginStore)
var LoginStore = new _LoginStore()

function _loginUser (user, jwt) {
  LoginStore._user = user
  LoginStore._jwt = jwt
}

AppDispatcher.register(function (payload) {
  switch (payload.type) {
    case ActionTypes.USER_LOGGED_IN:
      _loginUser(payload.user, payload.jwt)
      LoginStore.trigger(CHANGE_EVENT)
      break
  }
})
