const path = require('path')
const fs = require('fs')
const feathers = require('@feathersjs/client')
const io = require('socket.io-client')

var socket = io.connect('http://localhost:3000', {
  'transports': [
    'websocket',
    'flashsocket',
    'jsonp-polling',
    'xhr-polling',
    'htmlfile'
  ]
})

module.exports = function () {
  const app = this
  console.log('in create default user')

  const client = feathers()
    .configure(feathers.socketio(socket))
    .configure(feathers.authentication())

  const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL
  const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD

  return app.service('users').find({
    email: DEFAULT_USER_EMAIL
  }).then(function (users) {
    return users.data.length > 0
  }).then(function (foundUser) {
    if (!foundUser) {
      return app.service('users').create({
        email: DEFAULT_USER_EMAIL,
        password: DEFAULT_USER_PASSWORD
      })
    } else {
      return true
    }
  }).then(function (userOrTrue) {
    return client.authenticate({
      strategy: 'jwt',
      email: DEFAULT_USER_EMAIL,
      password: DEFAULT_USER_PASSWORD
    })
  }).then(function (authResult) {
    if (authResult !== undefined) {
      fs.writeFile(path.join(__dirname, 'DEFAULT_USER_TOKEN.txt'), authResult.accessToken, function (err) {
        if (err) {
          return console.log(err)
        }
      })
      socket.disconnect()
      return true
    } else {
      console.log('auth error')
      socket.disconnect()
      return false
    }
  }).catch(function (err) {
    console.log('could not connect to app', err)
    socket.disconnect()
    return false
  })
}
