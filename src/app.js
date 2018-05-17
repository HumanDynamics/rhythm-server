'use strict'

const path = require('path')
const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const compress = require('compression')
const cors = require('cors')
const configuration = require('@feathersjs/configuration')
const bodyParser = require('body-parser')
const socketio = require('@feathersjs/socketio')
const middleware = require('./middleware')
const services = require('./services')
const events = require('./events')
const jobs = require('./jobs')
const scripts = require('./scripts')
const channels = require('./channels')

// Create an Express compatible Feathers application
const app = express(feathers())
module.exports = app

app.configure(configuration(path.join(__dirname, '..')))

// Add body parsing middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Initialize REST provider
app.configure(express.rest())

app.use(compress())
   .options('*', cors())
   .use(cors())
   .configure(socketio((io) => {
     io.set('transports', [
       'websocket',
       'flashsocket',
       'htmlfile',
       'xhr-polling',
       'jsonp-polling',
     ])

     io.on('connection', (socket) => {
       console.log('new connection!')
       events.configure(socket, app)
     })
   }))

// Statically host some files
app.use('/', express.static(app.get('www')))

app.configure(services)
   .configure(channels)
   .configure(middleware)
   .configure(scripts)

jobs.endMeetingJob.startJob(app)
