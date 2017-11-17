// turns-analytics.js
// Functions to analyze utterance records to generate turn data and turn
// statistics and save them to the `turn` service.
'use strict'

const winston = require('winston')
const _ = require('underscore')

// Assumes turns is reported in order
// Simply looks at order of speaking events, and counts a 'transition' where
// the speaker at index t is different than the speaker at index t+1.
// TODO: make more accurate. this is a naive implementation that does not
// take into account speaking overlap.
function getTurnTransitions (turns) {
  var transitions = 0
  var participantIds = _.map(turns, (turn) => { return turn.participant })
  _.each(participantIds, function (t, index, turns) {
    if (index !== 0) {
      if (t !== turns[index - 1]) {
        transitions += 1
      }
    }
  })
  return transitions
}

// returns an object that reports the total time spoken by
// the given participant ids in the given hangout.
// of the form:
// {<participantId>: <total ms>, ...}
// if participant_ids is false, matches on all participants.
function computeTurns (app, meeting, from, to) {
  from = new Date(from)
  to = new Date(to)
  winston.log('info', 'getting turn data for hangout', meeting._id, from, to)

  app.service('utterances').find({
    query: {
      meeting: meeting._id,
      // TODO: date stuff here isn't working all of a sudden.
      // should be able to do meeting AND start time.
      $and: [
        {startTime: {$gte: from.toISOString()}},
        {endTime: {$lte: to.toISOString()}}
      ],
      $select: ['participant', 'meeting', 'startTime', 'endTime']
    }
  }).then((utterances) => {
    // {'participant': [utteranceObj, ...]}
    var participantUtterances = _.groupBy(utterances, 'participant')

    // {'participant': # of utterances}
    var numUtterances = _.mapObject(participantUtterances, (val, key) => {
      return val.length
    })

    // total number of utterances by all participants
    var totalUtterances = _.reduce(_.pairs(numUtterances), (memo, val) => {
      return memo + val[1]
    }, 0)

    // distribution / "share" of utterances by participant
    var utteranceDistribution = []
    _.mapObject(numUtterances, (val, key) => {
      utteranceDistribution.push({
        participant: key,
        turns: val / totalUtterances // percentage of your total number of utterances relative to convo's total utterances. viz uses this to measure "contributions" to conversation with the ball
      })
    })

    var transitions = getTurnTransitions(utterances)

    var turnObj = {
      _id: meeting._id,
      meeting: meeting._id,
      room: meeting.room,
      turns: utteranceDistribution, // patch instead of update
      transitions: transitions, // patch instead of update
      timestamp: new Date(),
      from: from, // update, to make meetings.turn be the most updated turn in the last 5 min of that meeting (this is computed every 5 seconds)
      to: to // update
    }
    app.service('turns').get(meeting._id, {}).then((turn) => {
      app.service('turns').update(meeting._id, turnObj, {}).then((newTurn) => {
        winston.log('info', 'updated turns for meeting:', meeting._id)
      }).catch((err) => {
        winston.log('error', 'could not save turns for meeting:', turnObj, 'error:', err)
      })
    }).catch((err) => {
      winston.log('error', 'could not get turn', err)
      app.service('turns').create(turnObj, {}).then((newTurn) => {
        winston.log('info', 'created turns for meeting:', meeting._id)
      }).catch((err) => {
        winston.log('error', 'could not create turns for meeting:', turnObj, 'error:', err)
      })
    })
  }).catch((err) => {
    winston.log('error', 'couldnt get utterances...', err)
  })
}

module.exports = {
  computeTurns: computeTurns
}
