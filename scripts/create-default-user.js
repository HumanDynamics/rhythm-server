const server = require('../app.js')
const fs = require('fs')
const feathers = require('feathers-client')
const io = require('socket-io.client')


function createDefaultUser () {
  var socket = io.connect('http://localhost:3000', {
    'transports': [
      'websocket',
      'flashsocket',
      'jsonp-polling',
      'xhr-polling',
      'htmlfile'
    ]
  })

  const client = feathers()
    .configure(feathers.socketio(socket))
    .configure(feathers.hooks())
    .configure(feathers.authentication())

  const DEFAULT_USER_EMAIL = app.get('DEFAULT_USER_EMAIL')
  const DEFAULT_USER_PASSWORD = app.get('DEFAULT_USER_PASSWORD')
  
  app.service('users').create({
    email: DEFAULT_USER_EMAIL,
    password: DEFAULT_USER_PASSWORD
  }).then(function (user) {
    return client.authenticate({
      type: 'token',
      email: DEFAULT_USER_EMAIL,
      password: DEFAULT_USER_PASSWORD
    })
  }).then(function (authResult) {
    if (result !== undefined) {
      fs.writeFile('DEFAULT_USER_TOKEN.txt', result.token, function (err) {
        if (err) return console.log(err);
      });
      return true
    } else {
      console.log('auth error')
      return false
    }
  }).catch(function (err) {
    console.log('could not connect to app')
    return false
  })
}

module.exports = createDefaultUser
