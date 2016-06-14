import AppDispatcher from '../dispatcher/dispatcher'
import LoginConstants from '../constants/LoginConstants'
import LoginAPIUtils from '../api/LpginAPIUtils'
var ActionTypes = LoginConstants.ActionTypes

module.exports = {
  login: function (email, password) {
    AppDispatcher.dispatch({
      type: ActionTypes.LOGIN_USER,
      email: email,
      password: password
    })
  }
}
