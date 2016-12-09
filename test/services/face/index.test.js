/* eslint-env mocha */
'use strict'

const assert = require('assert')
const app = require('../../../src/app')

describe('face service', () => {
  it('registered the faces service', () => {
    assert.ok(app.service('faces'))
  })
})
