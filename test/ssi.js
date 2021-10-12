const { test } = require('tap')
const { fake } = require('sinon')

const logger = require('../lib/log')

logger.log = fake()

test('replace echo value', async assert => {
  assert.plan(1)

  process.env.FOO = 'bar'

  const result = require('../lib/ssi')('<!--#echo var="FOO" -->')

  assert.equal(result, 'bar')
})

test('empty echo value', async assert => {
  assert.plan(1)

  const result = require('../lib/ssi')('<!--#echo var="BAR" -->')

  assert.equal(result, '')
})

test('multple echo statements', async assert => {
  assert.plan(1)

  process.env.FOO = 'hello'
  process.env.BAR = ' '
  process.env.BAZ = 'world'

  const result = require('../lib/ssi')('<!--#echo var="FOO" --><!--#echo var="BAR" --><!--#echo var="BAZ" -->')

  assert.equal(result, 'hello world')
})

test('set values', async assert => {
  assert.plan(2)

  const result = require('../lib/ssi')(`
    <!--#set var="MESSAGE" value="hello world" -->
    <!--#echo var="MESSAGE" -->
  `)

  assert.equal(result.trim(), 'hello world')
  assert.equal(process.env.MESSAGE, 'hello world')
})

test('set values', async assert => {
  assert.plan(1)

  process.env.FOO = 'bar'

  const result = require('../lib/ssi')('<!--#printenv -->')

  // result should be a JSON string!
  const env = JSON.parse(result)

  assert.equal(env.FOO, 'bar')
})

test('unsupported directives', async assert => {
  assert.plan(2)

  const result = require('../lib/ssi')('<!--#foobar -->')

  assert.equal(result, '<!--#foobar -->')
  assert.ok(logger.log.calledWith('%dot:red unsupported SSI directive %s', 'foobar'))
})
