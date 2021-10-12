const { test } = require('tap')
const { fake } = require('sinon')

const logger = require('../lib/log')

logger.log = fake()

test('sse events', async assert => {
  assert.plan(3)

  const response = {
    write: fake()
  }

  const event = require('../lib/sse')([response])
  await event('change', '/foo.html')

  assert.ok(logger.log.calledWith('%dot:yellow %s:dim %s:blue', 'change', '/foo.html'))
  assert.ok(response.write.calledWith('event: change\ndata: /foo.html\n\n'))
  assert.ok(response.write.calledWith('event: all\ndata: /foo.html\n\n'))
})
