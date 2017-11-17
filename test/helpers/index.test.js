/* eslint-env mocha */
'use strict'

const assert = require('assert')
const _ = require('underscore')
const helpers = require('../../src/helpers')

describe('json transform', function () {
  it('should transform shallow values of a json object', function (done) {
    var obj = {
      a: 2,
      b: 3,
      c: 4
    }
    var newObj = helpers.transformKeys(obj, ['a'], (val) => { return val + 1 })
    assert(_.isEqual(newObj, {
      a: 3,
      b: 3,
      c: 4
    }))
    done()
  })

  it('should transform nested values of a json object', function (done) {
    var obj = {
      a: {d: 2},
      b: 3,
      c: 4
    }
    var newObj = helpers.transformKeys(obj, ['d'], (val) => { return val + 1 })
    assert(_.isEqual(newObj, {
      a: {d: 3},
      b: 3,
      c: 4
    }))
    done()
  })

  it('should transform array values of a json object', function (done) {
    var obj = {
      a: [2, 3],
      b: 3,
      c: 4
    }
    var newObj = helpers.transformKeys(obj, ['a'], (val) => { return val + 1 })
    assert(_.isEqual(newObj, {
      a: [3, 4],
      b: 3,
      c: 4
    }))
    done()
  })
})
