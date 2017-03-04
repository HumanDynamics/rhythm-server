'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('frame service', function() {
  it('registered the frames service', () => {
    assert.ok(app.service('frames'));
  });
});
