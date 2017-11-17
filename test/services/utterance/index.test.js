/* eslint-env mocha */
'use strict'

const assert = require('assert')
const winston = require('winston')
const app = require('../../../src/app')
const io = require('socket.io-client')
const dropDatabase = require('../../shared/global-before').dropDatabase

describe('utterance service', () => {
  var fakeJoinedEvent = {
    participant: 'bob',
    room: 'roomName',
    name: 'fakeParticipantName',
    email: 'fake@email.com',
    consent: true,
    consentDate: new Date().toISOString()
  }

  var socket = io.connect('http://localhost:3000', {
    'transports': [
      'websocket',
      'flashsocket',
      'jsonp-polling',
      'xhr-polling',
      'htmlfile'
    ]
  })

  let d1 = new Date()
  var utterances = [
    {
      participant: 'bob',
      room: 'roomName',
      startTime: d1 - 9000,
      endTime: d1 - 5000,
      volumes: []
    },
    {
      participant: 'bob',
      room: 'roomName',
      startTime: d1 - 4000,
      endTime: d1 - 2000,
      volumes: []
    },
    {
      participant: 'bob',
      room: 'roomName',
      startTime: d1 - 1950,
      endTime: d1,
      volumes: []
    }

  ]

  before(function (done) {
    dropDatabase().then(() => {
      socket.emit('meetingJoined', fakeJoinedEvent)
      socket.disconnect()
      setTimeout(() => { done() }, 400)
    }).catch((err) => { done(err) })
  })

  after(function (done) {
    dropDatabase().then(() => { done() })
  })

  it('registered the utterances service', (done) => {
    assert.ok(app.service('utterances'))
    done()
  })

  it('created an utterance', function (done) {
    app.service('utterances').create(utterances[0]).then((utter) => {
      winston.log('info', 'utterance created', JSON.stringify(utter))
      assert(utter.meeting !== undefined)
      assert.equal(utter.startTime.getTime(), utterances[0].startTime)
      assert.equal(utter.endTime.getTime(), utterances[0].endTime)
      assert.equal(utter.participant, utterances[0].participant)
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('created a second utterance', function (done) {
    app.service('utterances').create(utterances[1]).then((utter) => {
      winston.log('info', 'utterance created', JSON.stringify(utter))
      assert(utter.meeting !== undefined)
      assert.equal(utter.startTime.getTime(), utterances[1].startTime)
      assert.equal(utter.endTime.getTime(), utterances[1].endTime)
      assert.equal(utter.participant, utterances[1].participant)
      done()
    }).catch((err) => {
      done(err)
    })
  })

  it('merged the third utterance', function (done) {
    app.service('utterances').create(utterances[2]).then((drop) => {
      winston.log('info', 'third utt', JSON.stringify(drop))
      app.service('utterances').find().then((utts) => {
        assert.equal(utts.length, 2)
        let utter
        if (utts[0].startTime === utterances[0].startTime) {
          utter = utts[0]
        } else {
          utter = utts[1]
        }
        assert.equal(utter.startTime.getTime(), utterances[1].startTime)
        assert.equal(utter.endTime.getTime(), utterances[2].endTime.getTime())
        assert.equal(utter.participant, utterances[1].participant)
        done()
      }).catch((err) => {
        done(err)
      })
    }).catch((err) => {
      done(err)
    })
  })
})
