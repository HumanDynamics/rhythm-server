/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')
const feathers = require('feathers-client')
const _ = require('underscore')
const io = require('socket.io-client')

describe('authorization', function () {
  var socket = io.connect('http://localhost:3000', {
    'transports': [
      'websocket',
      'flashsocket',
      'jsonp-polling',
      'xhr-polling',
      'htmlfile'
    ]
  })

  const app = feathers().configure(feathers.socketio(socket))
                        .configure(feathers.hooks())
                        .configure(feathers.authentication())

  before(function (done) {
    app.service('users').create({
      email: 'hello',
      password: 'password'
    }).then(function (user) {
      done()
    }).catch(function (err) {
      winston.log('info', 'auth error:', err)
      done(err)
    })
  })

  it('authorizes an existing user with JWT', function (done) {
    app.authenticate({
      type: 'token',
      email: 'hello',
      password: 'password'
    }).then((result) => {
      winston.log('info', 'JWT TOKEN:', result)
      assert(result !== undefined)
      winston.log('info', 'auth no result:', result)
      done()
    }).catch((err) => {
      winston.log('info', 'auth error:', err)
      done(err)
    })
  })

  it('restricts access to meetings based on authorization', function (done) {
    var socket = io.connect('http://localhost:3000', {
      'transports': [
        'websocket',
        'flashsocket',
        'jsonp-polling',
        'xhr-polling',
        'htmlfile'
      ]
    })

    var _app = feathers().configure(feathers.socketio(socket))
                         .configure(feathers.hooks())
                         .configure(feathers.authentication())
    _app.service('meetings').find().then((meetings) => {
      assert(false)
      done()
    }).catch((err) => {
      assert(err.code === 401)
      done()
    })
  })
})
