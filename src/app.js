'use strict'

const path = require('path')
const serveStatic = require('@feathersjs/feathers').static
const express = require('@feathersjs/express');
const compress = require('compression')
const cors = require('cors')
const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const rest = require('@feathersjs/express/rest')
const bodyParser = require('body-parser')
const socketio = require('@feathersjs/socketio')
const middleware = require('./middleware')
const services = require('./services')
const events = require('./events')
const jobs = require('./jobs')
const scripts = require('./scripts')
const app = module.exports = express(feathers())

app.configure(configuration(path.join(__dirname, '..')))

app.use(compress())
   .options('*', cors())
   .use(cors())
   .use('/', express(serveStatic(app.get('www'))))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: true }))
   .configure(rest())
   .configure(socketio((io) => {
     io.set('transports', [
       'websocket',
       'flashsocket',
       'htmlfile',
       'xhr-polling',
       'jsonp-polling'
     ])

     io.on('connection', (socket) => {
       console.log('new connection!')
       events.configure(socket, app)
     })
   }))
   .configure(services)
   .configure(middleware)
   .configure(scripts)

jobs.endMeetingJob.startJob(app)
