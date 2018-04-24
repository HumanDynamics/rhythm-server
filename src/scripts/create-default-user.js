const winston = require('winston')
const path = require('path')
const fs = require('fs')
const io = require('socket.io-client')
const feathers = require('@feathersjs/feathers')
const socketio = require('@feathersjs/socketio-client')
const auth = require('@feathersjs/authentication-client')

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
  winston.info('in create default user')

  // TODO: this is now in 3 places, it really should be somewhere common like a config file -mjl 2018-04-24
  let config = {
    jwt: {},
    secret: process.env.AUTH_TOKEN_SECRET,
    expiresIn: process.env.AUTH_TOKEN_EXPIRESIN,
    local: {}
  }

  const client = feathers()
    .configure(socketio(socket))
    .configure(auth(config))

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
