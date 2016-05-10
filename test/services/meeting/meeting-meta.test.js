/* eslint-env mocha */

'use strict'

const assert = require('assert')
const app = require('../../../src/app')
const _ = require('underscore')

describe('meta data in meeting', function () {
  var d1 = new Date()
  var d2 = d1
  d2 = d2.setDate(d2.getDate() - 2)

  var m1 = {
    _id: 'meeting-metadata-0',
    participants: [],
    startTime: d2,
    endTime: d1,
    active: false
  }

  var m2 = {
    _id: 'meeting-metadata-1',
    participants: [],
    startTime: d2,
    endTime: d1,
    active: false,
    meta: {key: 'value'}
  }

  it('successfully saves a meeting with no metadata', function (done) {
    app.service('meetings').create(m1)
       .then(function (meeting) {
         assert(m1)
         done()
       }).catch(function (err) {
         done(err)
       })
  })

  it('successfully saves a meeting that has metadata', function (done) {
    app.service('meetings').create(m2)
       .then(function (meeting) {
         assert(_.has(m2, 'meta'))
         assert(_.isEqual(m2.meta, {key: 'value'}))
         done()
       }).catch(function (err) {
         done(err)
       })
  })

  it('successfully finds a meeting with meta filter', function (done) {
    app.service('meetings').find({query: {meta: {key: 'value'}}})
       .then(function (meetings) {
         assert(meetings[0]._id === 'meeting-metadata-1')
         done()
       }).catch(function (err) {
         done(err)
       })
  })

  it('doesnt find a meeting with meta when there isnt one', function (done) {
    app.service('meetings').find({query: {meta: {key: 'not value'}}})
       .then(function (meetings) {
         assert(_.isEmpty(meetings))
         done()
       }).catch(function (err) {
         done(err)
       })
  })
})
