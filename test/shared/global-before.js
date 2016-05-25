/* eslint-env mocha */
'use strict'

const feathersServer = require('feathers')
const MongoClient = require('mongodb').MongoClient
const winston = require('winston')
const Promise = require('promise')
const mongoose = require('mongoose')
const feathers = require('feathers-client')
const io = require('socket.io-client')

// for server
const hooks = require('feathers-hooks')
const user = require('../../src/services/user')

function dropDatabase () {
  winston.log('info', 'dropping db..')
  var connectedDb = null
  return MongoClient.connect('mongodb://localhost:27017/breakout')
                    .then((db) => {
                      connectedDb = db
                      return db.dropDatabase()
                    })
                    .then(() => { return connectedDb })
}

function createUser (db) {
  winston.log('info', 'creating user...')
  return new Promise(function (resolve, reject) {
    db.close().then(function () {
      mongoose.connect('mongodb://localhost:27017/breakout')
      mongoose.Promise = global.Promise
    })
    var serverNoAuth = feathersServer().configure(hooks()).configure(user)
    // serverNoAuth.listen(3000)
    return serverNoAuth.service('users').create({
      email: 'hello',
      password: 'password'
    }).then((user) => {
      winston.log('info', 'created user...')
      resolve(user)
    }).catch((err) => {
      winston.log('info', 'error creating user:', err)
      reject(err)
    })
  })
}

function authenticate () {
  var socket = io.connect('http://localhost:3000', {
    'transports': [
      'websocket',
      'flashsocket',
      'jsonp-polling',
      'xhr-polling',
      'htmlfile'
    ]
  })
  const client = feathers().configure(feathers.socketio(socket))
                           .configure(feathers.hooks())
                           .configure(feathers.authentication())
  return client.authenticate({
    type: 'local',
    email: 'hello',
    password: 'password'
  }).then((res) => {
    return client
  })
}

before(function (done) {
  dropDatabase().then(createUser)
                .then(authenticate)
                .then((app) => {
                  global.app = app
                  done()
                }).catch((err) => {
                  done(err)
                  winston.log('info', '[pre-test] error creating test app:', err)
                })
})

module.exports.dropDatabase = dropDatabase
