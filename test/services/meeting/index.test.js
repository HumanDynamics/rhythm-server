/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Faker = require('Faker')

const app = require('../../../src/app')

describe('meeting service', () => {
  var testMeeting = {
    _id: Faker.Helpers.randomNumber(500).toString(),
    participants: ['p1', 'p2', 'p3'],
    startTime: Faker.Date.recent(),
    active: false
  }

  console.log('test meeting:', testMeeting)

  it('registered the meeting service', () => {
    assert.ok(app.service('meetings'))
  })

  it('creates a new meeting', function (done) {
    app.service('meetings')
       .create(testMeeting, {})
       .then((meeting) => {
         assert(meeting._id === testMeeting._id)
         done()
       }).catch((err) => {
         done(err)
       })
  })
})
