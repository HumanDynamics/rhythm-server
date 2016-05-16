/* eslint-env mocha */
'use strict'

const assert = require('assert')
const request = require('request')
const app = require('../src/app')

before(function (done) {
  this.server = app.listen(3000)
  this.server.once('listening', done)
})

after(function (done) {
  this.timeout(5000)
  this.server.close(done)
})

describe('Feathers application tests', function () {
  describe('404', function () {
    it('shows a 404 JSON error without stack trace', function (done) {
      request({
        url: 'http://localhost:3000/path/to/nowhere',
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
