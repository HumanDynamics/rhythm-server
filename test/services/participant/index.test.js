/* eslint-env mocha */
'use strict'

const assert = require('assert')
const app = require('../../../src/app')
const crypto = require('../../../src/helpers').crypto
var mongo = require('mocha-mongo')(app.get('mongodb'))

var testParticipant = {
  _id: 'p1',
  name: 'John',
  meeting: 'meeting1',
  consent: false,
  consentDate: new Date()
}

describe('participant service', () => {
  it('registered the participants service', () => {
    assert.ok(app.service('participants'))
  })

  var clean = mongo.cleanCollections(['meetings'])

  it('creates a new participant', clean(function (db, done) {
    app.service('participants')
    .create(testParticipant, {})
    .then((participant) => {
      assert(testParticipant._id === participant._id)
      done()
    }).catch((err) => {
      done(err)
    })
  })
)
})
