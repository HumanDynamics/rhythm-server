/* eslint-env mocha */
'use strict'

const assert = require('assert')
const request = require('request')
const app = require('../src/app')
const loadtest = require('loadtest')

before(function (done) {
  this.server = app.listen(3030)
  this.server.once('listening', done)
})

after(function (done) {
  this.server.close(done)
})

describe('Feathers application tests', function () {
  it('starts and shows the index page', function (done) {
    request('http://localhost:3030', function (err, res, body) {
      assert.ok(body.indexOf('<html>') !== -1)
      done(err)
    })
  })

  describe('404', function () {
    /* it('shows a 404 HTML page', (done) => {
       request('http://localhost:3030/path/to/nowhere', (err, res, body) => {
       assert.equal(res.statusCode, 404)
       assert.ok(body.indexOf('<html>') !== -1)
       done(err)
       })
       }) */

    it('shows a 404 JSON error without stack trace', function (done) {
      request({
        url: 'http://localhost:3030/path/to/nowhere',
        json: true
      }, function (err, res, body) {
        assert.equal(res.statusCode, 404)
        assert.equal(body.code, 404)
        assert.equal(body.message, 'Page not found')
        assert.equal(body.name, 'NotFound')
        done(err)
      })
    })
  })
})


describe('Load tests', function () {
  this.timeout(20000)
  it('should add particpants to hangouts', function (done) {
    var requestId = 0;
    var testOpts = {
      url: 'ws://localhost:3030',
			concurrency: 10,
      maxSeconds: 10,
      body: {
        type: 'hangout::joined',
        participantId: requestId,
        participantName: 'Test Participant ' + requestId,
        participantLocale: 'Test Locale',
        meeting: 'Meeting ' + requestId,
        participants: []
      }
    }

    loadtest.loadTest(testOpts, function (error, result) {
      if (error) {
        done(err)
      }
      console.log(result)
      done()
    })
  })
})
