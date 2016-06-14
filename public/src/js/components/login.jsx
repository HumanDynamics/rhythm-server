import React from 'react'

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import LoginActions from '../actions/LoginActionCreators'

class Login extends React.Component {
  constructor (props, context) {
    super(props, context)
  }

  handleClickClear(event) {
    LoginActions.login(
  }

  render () {
    return (
      <div>
        <TextField hintText="Email"
                   floatingLabelText="Email"/>
        <br/>
        <TextField hintText="Password"
                   floatingLabelText="Password"
                   type="password"/>
        <br/>
        <RaisedButton label="Login" primary={true}/>
      </div>
    )
  }
}
