'use strict'

const path = require('path')
const serveStatic = require('feathers').static
const compress = require('compression')
const cors = require('cors')
const feathers = require('feathers')
const configuration = require('feathers-configuration')
const hooks = require('feathers-hooks')
const rest = require('feathers-rest')
const bodyParser = require('body-parser')
const socketio = require('feathers-socketio')
const middleware = require('./middleware')
const services = require('./services')
const events = require('./events')
const jobs = require('./jobs')
const scripts = require('./scripts')
const app = module.exports = feathers()

app.configure(configuration(path.join(__dirname, '..')))

app.use(compress())
   .options('*', cors())
   .use(cors())
   .use('/', serveStatic(app.get('www')))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: true }))
   .configure(hooks())
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
       events.configure(socket, app)
     })
   }))
   .configure(services)
   .configure(middleware)
   .configure(scripts)

jobs.endMeetingJob.startJob(app)
