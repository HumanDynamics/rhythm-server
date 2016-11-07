// deactivate-meeting-hook.js -- Before, patch. sets a meeting to inactive
// if it's going from n to 0 participant before a `patch` event
// will also:
// - generate meeting events for meeting ends
// - end turn computation when a meeting stops
'use strict'
const _ = require('underscore')
const winston = require('winston')

var d3 = require('d3')
var jsdom = require('jsdom')
var nodemailer = require('nodemailer')
var request = require('request')

function shouldMakeMeetingInactive (newParticipants, meetingObject) {
  return (newParticipants.length === 0 &&
          meetingObject.participants.length > 0 &&
          meetingObject.active === true)
}

function reportMeeting (hook) {
  getReportData(hook, (visualizationData, addresses) => {
    sendReport(createVisualization(visualizationData), addresses)
  })
}

function getReportData (hook, callback) {
  winston.log('info', 'Getting report data...')
  // find participant events (-> historical participants)
  return hook.app.service('participants').find({
    query: {
      $select: [ '_id', 'name', 'meetings' ]
    }
  }).then((participants) => {
    var validParticipants = _.filter(participants.data, (participant) => {
      return _.contains(participant.meetings, hook.id)
    })
    // find utterances
    hook.app.service('utterances').find({
      query: {
        meeting: hook.id,
        $select: [ 'participant', 'meeting', 'startTime', 'endTime' ]
      }
    }).then((utterances) => {
      // {'participant': [utteranceObject, ...]}
      var participantUtterances = _.groupBy(utterances, 'participant')
      // {'participant': number of utterances}
      var numUtterances = _.mapObject(participantUtterances, (val, key) => {
        return val.length
      })
      // {'participant': mean length of utterances in seconds}
      var meanLengthUtterances = _.mapObject(participantUtterances, (val, key) => {
        var lengthsUtterances = val.map((utteranceObject) => {
          return (new Date(utteranceObject.endTime).getTime() - new Date(utteranceObject.startTime).getTime()) / 1000
        })
        var sum = lengthsUtterances.reduce((previous, current) => current + previous, 0)
        return sum / lengthsUtterances.length
      })
      // [{'name': ..., 'numUtterances': ..., 'meanLengthUtterances': ...}, ...]
      var visualizationData = validParticipants.map((participant) => {
        var participantId = participant[ '_id' ]
        return {
          name: participant[ 'name' ],
          numUtterances: participantId in numUtterances ? numUtterances[ participantId ] : 0,
          meanLengthUtterances: participantId in meanLengthUtterances ? meanLengthUtterances[ participantId ] : 0
        }
      })
      // get mapping between google id and addresses
      request.get(process.env.MAPPING_URL, function (error, response, body) {
        // {'_id': address, ...}
        var mapping = {}
        if (!error && response.statusCode === 200) {
          var rows = body.split('\n')
          for (var i = 0; i < rows.length; i++) {
            var cols = rows[ i ].split(',')
            mapping[ String(cols[ 0 ]) ] = cols[ 1 ]
          }
        }
        // [address, ...]
        var addresses = validParticipants.map((participant) => {
          return mapping[ participant[ '_id' ] ]
        })
        callback(visualizationData, addresses)
      }).catch(function (error) {
        winston.log('info', '[getReportData] error: ', error)
      })
    })
  })
}

function createVisualization (visualizationData) {
  winston.log('info', 'Creating report visualization...')
  var margin = { top: 20, right: 15, bottom: 60, left: 60 }
  var width = 800 - margin.left - margin.right
  var height = 500 - margin.top - margin.bottom
  var color = d3.scale.category20()

  var x = d3.scale.linear()
    .domain([ 0, d3.max(visualizationData, function (d) { return d.meanLengthUtterances }) + 5 ])
    .range([ 0, width ])

  var y = d3.scale.linear()
    .domain([ 0, d3.max(visualizationData, function (d) { return d.numUtterances }) + 1 ])
    .range([ height, 0 ])

  var document = jsdom.jsdom()
  var chart = d3.select(document.body)
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart')

  var main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main')

  // draw the x axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')

  main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis)
    .append('text')
    .attr('class', 'label')
    .attr('x', width)
    .attr('y', -15)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Avg. Length of Turns')

  // draw the y axis
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')

  main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis)
    .append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Turns Taken')

  var g = main.append('svg:g')

  var node = g.selectAll('scatter-dots')
    .data(visualizationData)
    .enter().append('g')

  node.append('svg:circle')
    .style('fill', function (d) { return color(d.name) })
    .attr('cx', function (d, i) { return x(d.meanLengthUtterances) })
    .attr('cy', function (d) { return y(d.numUtterances) })
    .attr('r', 10)

  node.append('text')
    .attr('x', function (d) { return x(d.meanLengthUtterances) + 10 })
    .attr('y', function (d) { return y(d.numUtterances) })
    .text(function (d) { return d.name })

  // create html file
  var htmlStyle = '<style>\n' +
    'body {\n' +
    'font-family: "Helvetica", "Arial", sans-serif;\n' +
    'color: #444444;\n' +
    'font-size: 9pt;\n' +
    'background-color: #FAFAFA;\n' +
    '}\n' +
    '.axis path,\n' +
    '.axis line {\n' +
    'fill: none;\n' +
    'stroke: #000;\n' +
    'shape-rendering: crispEdges;\n' +
    '}\n' +
    '.dot {\n' +
    'stroke: #000;\n' +
    '}\n' +
    '.tooltip {\n' +
    'position: absolute;\n' +
    'width: 200px;\n' +
    'height: 28px;\n' +
    'pointer-events: none;\n' +
    '}\n' +
    '.node {\n' +
    'stroke: #fff;\n' +
    'stroke-width: 1.5px;\n' +
    '}\n' +
    '.link {\n' +
    'stroke: #999;\n' +
    'stroke-opacity: .6;\n' +
    '}\n' +
    'path.link {\n' +
    'fill: none;\n' +
    'stroke: #000;\n' +
    'stroke-width: 4px;\n' +
    'cursor: default;\n' +
    '}\n' +
    '</style>\n'
  var htmlBody = '<body>\n' +
    '<h1>Your Meeting: Turn Taken</h1>\n' +
    d3.select(document.body).node().innerHTML + '\n' +
    '</body>'
  var html = '<!DOCTYPE html>\n' +
    '<meta charset="utf-8">\n' +
    htmlStyle +
    htmlBody

  return html
}

function sendReport (visualization, addresses) {
  winston.log('info', 'Sending report...')
  // TODO change SMTP configurations
  // define SMTP configurations
  var smtpConfig = {
    host: process.env.REPORT_EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.REPORT_EMAIL_LOGIN,
      pass: process.env.REPORT_EMAIL_PASSWORD
    }
  }
  // create transporter object
  var transporter = nodemailer.createTransport(smtpConfig)
  // TODO change email data
  // setup email data
  var mailOptions = {
    from: process.env.REPORT_EMAIL_FROM,
    to: addresses,
    subject: process.env.REPORT_EMAIL_SUBJECT,
    text: process.env.REPORT_EMAIL_TEXT,
    html: process.env.REPORT_EMAIL_TEXT,
    attachments: {
      filename: 'visualization.html',
      content: visualization
    }
  }
  // send email with transporter object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log('[sendReport] error: ' + error)
    }
    return console.log('Report was sent: ' + info.response)
  })
}

function createMeetingEndEvent (hook) {
  var meetingId = (hook.method === 'create') ? hook.data._id : hook.id
  return hook.app.service('meetingEvents').create({
    meeting: meetingId,
    event: 'end',
    timestamp: new Date()
  }, {}).then((meetingEvent) => {
    return hook
  })
}

module.exports = function (hook) {
  if (!_.has(hook.data, 'participants')) {
    return hook
  } else {
    return hook.app.service('meetings').get(hook.id)
               .then((meeting) => {
                 if (shouldMakeMeetingInactive(hook.data.participants, meeting)) {
                   hook.data.active = false
                   hook.data.endTime = new Date()
                   if (process.env.SEND_REPORT) {
                     reportMeeting(hook)
                   }
                   return createMeetingEndEvent(hook)
                 } else {
                   return hook
                 }
               })
  }
}
