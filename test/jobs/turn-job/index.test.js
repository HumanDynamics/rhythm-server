/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Faker = require('Faker')
const winston = require('winston')
const _ = require('underscore')

const app = require('../../../src/app')
const turnJob = require('../../../src/jobs').turnJob
const turnAnalytics = require('../../../src/jobs/turn-job/turn-analytics')

var startTime = (new Date()).getTime() - 1 * 1000

var testParticipants = [
  {
    _id: 'p1a',
    consent: true,
    name: 'p1'
  },
  {
    _id: 'p2a',
    consent: true,
    name: 'p2'
  },
  {
    _id: 'p3a',
    consent: true,
    name: 'p3'
  }
]

var testMeeting = {
  _id: Faker.Helpers.randomNumber(500).toString(),
  participants: ['p1a', 'p2a', 'p3a'],
  startTime: Faker.Date.recent(),
  active: true
}

var testUtterances = [
  { meeting: testMeeting._id,
    participant: testMeeting.participants[0],
    startTime: new Date(startTime),
    endTime: new Date(startTime + 1 * 50),
    volumes: _(10).times((n) => { return {'timestamp': '1', 'vol': Faker.Helpers.randomNumber(5) }})
  },
  { meeting: testMeeting._id,
    participant: testMeeting.participants[0],
    startTime: new Date(startTime + 2 * 50),
    endTime: new Date(startTime + 3 * 50),
    volumes: _(10).times((n) => { return {'timestamp': '1', 'vol': Faker.Helpers.randomNumber(5) }})
  },
  { meeting: testMeeting._id,
    participant: testMeeting.participants[1],
    startTime: new Date(startTime + 3 * 50),
    endTime: new Date(startTime + 4 * 50),
    volumes: _(10).times((n) => { return {'timestamp': '1', 'vol': Faker.Helpers.randomNumber(5) }})
  }
]

var expectedTurnData = [{
  participant: 'p1a',
  turns: (2 / 3)
}, {
  participant: 'p2a',
  turns: (1 / 3)
}]

describe('turn job hook', () => {
  before(function (done) {
    _.each(testParticipants, (p) => {
      app.service('participants').create(p)
         .then((p) => {
           if (p._id === 'p3a') {
             done()
           }
         }).catch((err) => {
           winston.log('info', 'couldnt create that participant', err)
           done(err)
         })
    })
  })

  it('started computing turns when a meeting was created', (done) => {
    app.service('meetings').create(testMeeting)
    .then((meeting) => {
      console.log(turnJob.processList)
      assert(_.has(turnJob.processList, meeting._id))
      done()
    }).catch((err) => {
      done(err)
    })
  })

  describe('turn computation', function (done) {
    before(function (done) {
      _.each(testUtterances, (utteranceObj) => {
        app.service('utterances').create(utteranceObj, {}).then((utterance) => {
          if (utterance.participant === testUtterances[2].participant) {
            done()
          }
        }).catch((err) => {
          console.log(utteranceObj)
          done(err)
        })
      })
    })

    it('correctly computed turns from utterance data', function (done) {
      this.timeout(6000)
      turnAnalytics.computeTurns(app, testMeeting._id, startTime, new Date())
      setTimeout(function () {
        app.service('turns').find({
          query: {
            meeting: testMeeting._id,
            from: startTime // look for the turn we made
          }
        }).then((turns) => {
          // pull out just the turns
          winston.log('info', turns)
          var turn = _.map(turns[0].turns, (t) => { return _.omit(t, '_id') })
          winston.log('info', turn, expectedTurnData)
          assert(JSON.stringify(turn) === JSON.stringify(expectedTurnData))
          done()
        }).catch((err) => {
          done(err)
        })
      }
        , 5000)
    })
  })

  it('stopped computing turns when a meeting is changed to inactive',
  function (done) {
    app.service('meetings').patch(testMeeting._id, {
      active: false
    }).then((meeting) => {
      assert(_.has(turnJob.processList, meeting._id) === false)
      done()
    }).catch((err) => {
      done(err)
    })
  })
})
