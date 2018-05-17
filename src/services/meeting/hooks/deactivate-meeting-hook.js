// deactivate-meeting-hook.js -- Before, patch. sets a meeting to inactive
// if it's going from n to 0 participant before a `patch` event
// will also:
// - generate meeting events for meeting ends
// - end turn computation when a meeting stops
'use strict'
const _ = require('underscore')
const winston = require('winston')

var d3 = Object.assign({},
                       require('d3-selection'),
                       require('d3-array'),
                       require('d3-axis'),
                       require('d3-scale'),
                       require('d3-scale-chromatic'))

var { JSDOM } = require('jsdom')
var nodemailer = require('nodemailer')

function shouldMakeMeetingInactive (newParticipants, meetingObject) {
  return (newParticipants.length === 0 &&
          meetingObject.participants.length > 0 &&
          meetingObject.active === true)
}

function reportMeeting (hook) {
  getReportData(hook, (visualizationData, addresses) => {
    winston.log('info', 'calling sendReport')
    sendReport(createVisualization(visualizationData), addresses)
  })
}

function getReportData (hook, callback) {
  winston.log('info', 'Getting report data...')
  // find participant events (-> historical participants)
  var meetingId = hook.id
  if (hook.id === Object(hook.id)) {
    meetingId = hook.id._id
  }
  winston.log('info', 'Generating report for meeting: ', meetingId)
  // TODO unless im misinterpreting this.... this is querying for all
  // participants (up to 1000), and then filtering on the results?
  // can we not query participants by meeting involvement?
  // at any rate, this fails if we have > 1000 users, no?
  // not that i really expect to see > 1000 users, but...
  return hook.app.service('participants').find({
    query: {
      $limit: 1000,
      $select: [ '_id', 'email', 'name', 'meetings' ]
    }
  }).then((participants) => {
    var validParticipants = _.filter(participants.data, (participant) => {
      return _.contains(participant.meetings, meetingId)
    })
    winston.log('info', 'generating report for participants', _.map(validParticipants, part => part._id))
    // find utterances
    hook.app.service('utterances').find({
      query: {
        meeting: meetingId,
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
        var participantId = participant['_id']
        return {
          name: participant['name'],
          numUtterances: participantId in numUtterances ? numUtterances[participantId] : 0,
          meanLengthUtterances: participantId in meanLengthUtterances ? meanLengthUtterances[participantId] : 0
        }
      })
      winston.log('info', 'getting addresses...')

      var addresses = validParticipants.map((participant) => {
        if (participant['email'] !== undefined) {
          return participant['email']
        } else {
          return 'invalid'
        }
      })
      winston.log('info', 'calling callback...')
      callback(visualizationData, addresses)
    })
  })
}

function createVisualization (visualizationData) {
  winston.log('info', 'Creating report visualization...')
  var margin = { top: 20, right: 15, bottom: 60, left: 60 }
  var width = 800 - margin.left - margin.right
  var height = 500 - margin.top - margin.bottom
  // TODO: think about color, start here: https://medium.com/@Elijah_Meeks/color-advice-for-data-visualization-with-d3-js-33b5adc41c90
  // d3 v5 removed category20 which was used here.
  var color = d3.scaleOrdinal(d3.schemeCategory10)

  var x = d3.scaleLinear()
    .domain([ 0, d3.max(visualizationData, function (d) { return d.meanLengthUtterances }) + 5 ])
    .range([ 0, width ])

  var y = d3.scaleLinear()
    .domain([ 0, d3.max(visualizationData, function (d) { return d.numUtterances }) + 1 ])
    .range([ height, 0 ])

  const { document } = (new JSDOM('')).window
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
  var xAxis = d3.axisBottom(x)

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
  var yAxis = d3.axisLeft(y)

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
    .enter()
    .append('g')

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
  // TODO pull this out to a file or smth
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
        d3.select(document.body).node().innerHTML + '\n' +
        '<h3> Interpreting this graph:</h3>\n' +
        '<p> For reference, we define a "turn" as a person speaking for about one second.\n' +
        'If the dots representing the members of your team are clustered together, this usually indicates that people have all contributed somewhat equally to the discussion.\n' +
        'If the dots representing the members of your team are widely distributed on the graph, this may indicate unequal participation in the discussion.\n' +
        'In general, the most effective teams, exhibiting productivity and creativity, have members who participate relatively equally in discussions.</p>\n' +
    '</body>'
  var html = '<!DOCTYPE html>\n' +
    '<meta charset="utf-8">\n' +
    htmlStyle +
    htmlBody

  return html
}

function sendReport (visualization, addresses) {
  winston.log('info', 'Sending report to addresses: ', addresses)
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
  // setup email data
  // we filter the obviously invalid emails out, but it's still
  // possible there could be invalid addresses here.
  // this is fine, it should still behave
  addresses = addresses.filter((ele) => ele !== 'invalid')
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
      winston.log('error', error)
      return console.log('[sendReport] error: ' + error)
    }
    winston.log('info', 'Report was sent', info.response)
    return console.log('Report was sent: ' + info.response)
  })
}

function createMeetingEndEvent (hook) {
  var meetingId = (hook.method === 'create') ? hook.data._id : hook.id      // eslint-disable-line no-extra-parens
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
