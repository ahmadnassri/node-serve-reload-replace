const os = require('os')

const { test } = require('tap')
const { stub } = require('sinon')

test('expand ~', assert => {
  assert.plan(1)

  const home = os.homedir()

  const { expandTilde } = require('../lib/path-utils')

  assert.equal(expandTilde('~'), home)
})

test('expand ~+', assert => {
  assert.plan(1)

  const { expandTilde } = require('../lib/path-utils')

  assert.equal(expandTilde('~+/foo'), `${process.cwd()}/foo`)
})

test('no os home', assert => {
  assert.plan(1)

  stub(os, 'homedir').returns(undefined)

  const { expandTilde } = require('../lib/path-utils')

  assert.equal(expandTilde('~/foo/bar'), '~/foo/bar')

  os.homedir.restore()
})

test('not a tilde', assert => {
  assert.plan(1)

  const { expandTilde } = require('../lib/path-utils')

  assert.equal(expandTilde('/foo/bar'), '/foo/bar')
})
