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
  var participant_ids = _.map(turns, (turn) => { return turn.participant })
  _.each(participant_ids, function (t, index, turns) {
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
  winston.log('info', 'getting turn data for hangout', meeting, from, to)

  app.service('utterances').find({
    query: {
      meeting: meeting,
      // TODO: date stuff here isn't working all of a sudden.
      // should be able to do meeting AND start time.
      $and: [
        {startTime: {$gte: from.toISOString()}},
        {endTime: {$lte: to.toISOString()}}
      ]
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
        turns: val / totalUtterances
      })
    })

    var transitions = getTurnTransitions(utterances)

    var turnObj = {
      meeting: meeting,
      turns: utteranceDistribution,
      transitions: transitions,
      timestamp: new Date(),
      from: from,
      to: to
    }
    app.service('turns').create(turnObj, {}).then((turns) => {
      winston.log('info', 'saved turns for meeting:', meeting)
    }).catch((err) => {
      winston.log('error', 'could not save turns for meeting:', turnObj, 'error:', err)
    })
  }).catch((err) => {
    winston.log('error', 'couldnt get turns...', err)
  })
}

module.exports = {
  computeTurns: computeTurns
}
