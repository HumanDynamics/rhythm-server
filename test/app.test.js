/* eslint-env mocha */
'use strict'

const assert = require('assert')
const request = require('request')
const app = require('../src/app')
const io = require('socket.io-client')
const feathers = require('feathers')
const Faker = require('Faker')
const _ = require('underscore')

before(function (done) {
  this.server = app.listen(3030)
  this.server.once('listening', done)
})

after(function (done) {
  this.timeout(5000)
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
  this.timeout(30000)
  var ioIndex = 0

  it('creates 100 sockets', function (done) {
    while (ioIndex < 100) {
      (function () {
        var socket = io.connect('http://localhost:3030', {'force new connection': true})
        socket.emit('meetingJoined', {
          participant: 'participant'+ioIndex,
          name: 'Participant '+ioIndex,
          meeting: 'meeting'+ioIndex,
          participants: []
        })

        var interval = Math.floor(Math.random()*1001) + 1000;
        setInterval(function () {
          socket.emit('speaking', {
            meeting: 'meeting'+ioIndex,
            participant: 'participant'+ioIndex,
            startTime: new Date(),
            endTime: new Date((new Date()).getTime() + 50),
            volumes: _(10).times((n) => { return Faker.Helpers.randomNumber(5) })
          })
        }, interval)
      })()
      ioIndex++
    }

    setTimeout(done, 15000);
    /*var turns = app.service('turns')
    turns.on('created', function (turn) {
      console.log("got a turn", turn)
      done();
    })*/
  })
})
