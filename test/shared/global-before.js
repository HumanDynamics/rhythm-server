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

global.socket = io.connect('http://localhost:' + process.env.PORT, {
  'transports': [
    'websocket',
    'flashsocket',
    'jsonp-polling',
    'xhr-polling',
    'htmlfile'
  ]
})

var mongoUrl = process.env.MONGODB_URI

function dropDatabase () {
  winston.log('info', 'dropping db..')
  var connectedDb = null
  return MongoClient.connect(mongoUrl)
                    .then((db) => {
                      connectedDb = db
                      return connectedDb.dropDatabase()
                    })
                    .then(() => { return connectedDb })
}

function createUser (db) {
  winston.log('info', 'creating user...')
  return new Promise(function (resolve, reject) {
    db.close().then(function () {
      mongoose.connect(mongoUrl)
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
  const client = feathers().configure(feathers.socketio(global.socket))
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

after(function (done) {
  dropDatabase().then(() => { done() }).catch((err) => { done(err) })
})

module.exports.dropDatabase = dropDatabase
