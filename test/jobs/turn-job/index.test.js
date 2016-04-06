/* eslint-env mocha */
'use strict'

const assert = require('assert')
const Faker = require('Faker')
const _ = require('underscore')

const app = require('../../../src/app')
const turnJob = require('../../../src/jobs').turnJob

describe('turn job hook', () => {
  var testMeeting = {
    _id: Faker.Helpers.randomNumber(500).toString(),
    participants: ['p1', 'p2', 'p3'],
    startTime: Faker.Date.recent(),
    active: true
  }

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

  it('stopped computing turns when a meeting is changed to inactive', (done) => {
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
