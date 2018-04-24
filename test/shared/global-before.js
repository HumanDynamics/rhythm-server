/* eslint-env mocha */
'use strict'

const winston = require('winston')
const Promise = require('promise')
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose')
const io = require('socket.io-client')
const feathers = require('@feathersjs/feathers')
const socketio = require('@feathersjs/socketio-client')
const auth = require('@feathersjs/authentication-client')

const user = require('../../src/services/user')

// to see debug log messages enable the following:
// winston.level = 'debug'

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
  var mongoClient = null
  return MongoClient.connect(mongoUrl)
                    .then((client) => {
                      mongoClient = client
                      return client.db().dropDatabase()
                    })
                    .then(() => { return mongoClient })
}

function createUser (mongoClient) {
  winston.log('info', 'creating user...')
  return new Promise(function (resolve, reject) {
    mongoClient.close().then(function () {
      mongoose.connect(mongoUrl)
      mongoose.Promise = global.Promise
    })
    var serverNoAuth = feathers().configure(user)
    // serverNoAuth.listen(3000)
    return serverNoAuth.service('users').create({
      email: 'hello',
      password: 'password'
    }).then((user) => {
      winston.info('created user...')
      winston.debug(user)
      resolve(user)
    }).catch((err) => {
      winston.log('info', 'error creating user:', err)
      reject(err)
    })
  })
}

function authenticate () {
  const client = feathers()
  let config = {
    jwt: {},
    secret: process.env.AUTH_TOKEN_SECRET,
    expiresIn: process.env.AUTH_TOKEN_EXPIRESIN,
    local: {}
  }
  client
    .configure(socketio(global.socket))
    .configure(auth(config))
  return client.authenticate({
    strategy: 'local',
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
