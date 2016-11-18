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
  getReportData(hook, (scatterData, historyData, addresses) => {
    sendReport(createHtml(scatterData, historyData), addresses)
  })
}

function getReportData (hook, callback) {
  winston.log('info', 'Getting report data...')
  // get meeting id
  var meetingId = hook.id
  if (hook.id === Object(hook.id)) {
    meetingId = hook.id._id
  }
  // find participants
  return hook.app.service('participants').find({
    query: {
      $limit: 1000,
      $select: [ '_id', 'name', 'meetings' ]
    }
  }).then((participants) => {
    var validParticipants = _.filter(participants.data, (participant) => {
      return _.contains(participant.meetings, meetingId)
    })
    // find historical meetings
    var meetingIds = _.union.apply(_, validParticipants.map((validParticipant) => {
      return validParticipant.meetings
    }))
    hook.app.service('meetings').find({
      query: {
        _id: {
          $in: meetingIds
        },
        $select: ['_id', 'endTime'],
        $sort: {endTime: 1}
      }
    }).then((meetings) => {
      // find (historical) utterances
      hook.app.service('utterances').find({
        query: {
          meeting: {
            $in: meetingIds
          },
          $select: [ 'participant', 'meeting', 'startTime', 'endTime' ],
          $sort: {startTime: 1}
        }
      }).then((utterances) => {
        // {'meting': [utteranceObject, ...]}
        var meetingUtterances = _.groupBy(utterances, 'meeting')
        var scatterData = []
        var historyData = []
        for (var meeting in meetingUtterances) {
          if (!meetingUtterances.hasOwnProperty(meeting)) {
            continue
          }
          // {'participant': [utteranceObject, ...]}
          var participantUtterances = _.groupBy(meetingUtterances[ meeting ], 'participant')
          // {'participant': number of utterances}
          var numUtterances = _.mapObject(participantUtterances, (val, key) => {
            return val.length
          })
          // {'participant': mean length of utterances in seconds}
          var meanLengthUtterances = _.mapObject(participantUtterances, (val, key) => {
            var lengthsUtterances = val.map((utterance) => {
              return (new Date(utterance.endTime).getTime() - new Date(utterance.startTime).getTime()) / 1000
            })
            var sum = lengthsUtterances.reduce((previous, current) => current + previous, 0)
            return sum / lengthsUtterances.length
          })
          // [{'name': ..., 'numUtterances': ..., 'meanLengthUtterances': ...}, ...]
          var data = validParticipants.map((participant) => {
            var participantId = participant[ '_id' ]
            return {
              name: participant[ 'name' ],
              numUtterances: participantId in numUtterances ? numUtterances[ participantId ] : 0,
              meanLengthUtterances: participantId in meanLengthUtterances ? meanLengthUtterances[ participantId ] : 0,
              meeting: _.findIndex(meetings, (meetingObject) => {
                if (meetingObject._id === meeting) {
                  return true
                }
                return false
              }) + 1
            }
          })
          historyData = historyData.concat(data)
          if (meeting === meetingId) {
            scatterData = scatterData.concat(data)
          }
        }
        // get mapping between google id and email addresses
        request.get(process.env.MAPPING_URL, function (error, response, body) {
          var mappings = {}
          if (!error && response.statusCode === 200) {
            mappings = JSON.parse(body)
          } else {
            winston.log('info', '[getReportData] error getting mapping: ', response)
          }
          // [address, ...]
          var addresses = validParticipants.map((participant) => {
            var validMapping = mappings.find((mapping) => {
              return mapping.googleId === participant._id
            })
            if (typeof validMapping !== 'undefined') {
              return validMapping.email
            }
            return
          })
          callback(scatterData, historyData, addresses)
        })
      }).catch(function (error) {
        winston.log('info', '[getReportData] error finding utterances: ', error)
      })
    }).catch(function (error) {
      winston.log('info', '[getReportData] error finding meetings: ', error)
    })
  }).catch(function (error) {
    winston.log('info', '[getReportData] error finding participants: ', error)
  })
}

function createHtml (scatterData, historyData, networkData) {
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
    '<h1>Your Meeting: Turns Taken</h1>\n' +
    '<p>We count a "turn" any time you speak for more than around a second. The most creative and productive teams might have their dots clumped near each other, showing that they have all contributed somewhat equally.</p>\n' +
    createScatterVisualization(scatterData) + '\n' +
    '<h1>All Meetings: Number of Turns Taken</h1>\n' +
    createHistoryVisualization(historyData) + '\n' +
    '</body>'
  var html = '<!DOCTYPE html>\n' +
    '<meta charset="utf-8">\n' +
    htmlStyle +
    htmlBody

  return html
}

function createScatterVisualization (scatterData) {
  var margin = { top: 20, right: 15, bottom: 60, left: 60 }
  var width = 800 - margin.left - margin.right
  var height = 500 - margin.top - margin.bottom
  var color = d3.scale.category20()

  var x = d3.scale.linear()
    .domain([ 0, d3.max(scatterData, function (d) { return d.meanLengthUtterances }) + 5 ])
    .range([ 0, width ])

  var y = d3.scale.linear()
    .domain([ 0, d3.max(scatterData, function (d) { return d.numUtterances }) + 1 ])
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
    .text('Avg. Length of Turns (in seconds)')

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
    .data(scatterData)
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

  return d3.select(document.body).node().innerHTML
}

function createHistoryVisualization (historyData) {
  var margin = {top: 20, right: 15, bottom: 60, left: 100}
  var width = 800 - margin.left - margin.right
  var height = 500 - margin.top - margin.bottom

  var color = d3.scale.category20()

  var x = d3.scale.linear()
    .domain([0, d3.max(historyData, function (d) { return d.meeting }) + 1])
    .range([ 0, width ])

  var y = d3.scale.ordinal()
    .domain(historyData.map(function (d) { return d.name }))
    .rangeRoundBands([ height, 0 ])

  var radius = d3.scale.linear()
    .domain([0, d3.max(historyData, function (d) { return d.numUtterances })])
    .range([0, 25])

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
    .tickValues(historyData.map(function (d) { return d.meeting }))
    .tickFormat(function (d) { return 'Meeting ' + d })

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
    .text('Meeting')

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
    .text('Group Member')

  var g = main.append('svg:g')

  var node = g.selectAll('scatter-dots')
    .data(historyData)
    .enter().append('g')

  node.append('svg:circle')
    .style('fill', function (d) { return color(d.name) })
    .attr('cx', function (d, i) { return x(d.meeting) })
    .attr('cy', function (d) { return y(d.name) + y.rangeBand() / 2 })
    .attr('r', function (d) { return radius(d.numUtterances) })

  node.append('text')
    .attr('x', function (d) { return x(d.meeting) })
    .attr('y', function (d) { return (y(d.name) + y.rangeBand() / 2) + 4 })
    .style('text-anchor', 'middle')
    .text(function (d) { return d.numUtterances })

  return d3.select(document.body).node().innerHTML
}

function sendReport (visualization, addresses) {
  winston.log('info', 'Sending report...')
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
  // setup email data
  var mailOptions = {
    from: process.env.REPORT_EMAIL_FROM,
    to: addresses,
    cc: process.env.REPORT_EMAIL_CC,
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
