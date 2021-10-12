const { EOL } = require('os')
const { EventEmitter } = require('events')

const { test, afterEach } = require('tap')
const { stub, fake } = require('sinon')

const logger = require('../lib/log')

class FakeRequest extends EventEmitter {
  constructor ({ httpVersion, method, url }) {
    super()

    this.httpVersion = httpVersion
    this.method = method
    this.url = url
    this.headers = { 'x-foo': 'bar' }
    this.rawHeaders = ['x-foo', 'bar']
  }
}

logger.log = stub()

afterEach(() => {
  logger.log.resetHistory()
})

const request = new FakeRequest({ httpVersion: 1, method: 'GET', url: '/' })

request.setMaxListeners(20)

const response = {
  end: fake(),
  setHeader: fake(),
  write: fake(),
  writeHead: fake(),
  getHeaders: () => {
    return { 'x-bar': 'baz' }
  }
}

const options = { clients: [], root: '/', index: 'index.html', verbose: false }

test('log request events: short', async assert => {
  assert.plan(1)

  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.ok(logger.log.calledWith('%dot:green %s:white %s:yellow ↦  %s:white %s:dim', 'GET', '/', response.statusCode, response.statusMessage))
})

test('log request events: verbose', async assert => {
  assert.plan(4)

  const options = { clients: [], root: '/', index: 'index.html', verbose: true }
  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.ok(logger.log.calledWith('%in:yellow %s:gray: %s:dim', 'x-foo', 'bar'))
  assert.ok(logger.log.calledWith('%in:yellow HTTP/%s:dim %s:white %s:yellow', 1, 'GET', '/'))
  assert.equal(response.statusCode, 404)
  assert.match(response.body, '<h1>Server Error:</h1>')
})

test('__events request', async assert => {
  assert.plan(2)

  request.url = '/__events'

  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.ok(response.writeHead.calledWith(200, {
    connection: 'keep-alive',
    'content-type': 'text/event-stream',
    'cache-control': 'no-store'
  }))

  assert.ok(logger.log.calledWith('%dot:yellow SSE Client Connected: %s:dim'))
})

test('__events closed', async assert => {
  assert.plan(1)

  request.url = '/__events'

  const event = require('../lib/handler')(options)
  await event(request, response)

  request.emit('close')

  assert.ok(logger.log.calledWith('%dot:yellow SSE Client Disconnected: %s:dim'))
})

test('__client request', async assert => {
  assert.plan(1)

  request.url = '/__client'

  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.ok(response.writeHead.calledWith(200, {
    connection: 'keep-alive',
    'content-type': 'text/event-stream',
    'cache-control': 'no-store'
  }))
})

test('__client custom', async assert => {
  assert.plan(2)

  process.env.FOO = 'hi'

  request.url = '/__client'

  const options = { clients: [], root: process.cwd(), index: 'index.html', client: '/test/fixtures/custom.client', verbose: false }

  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.equal(response.statusCode, 404)
  assert.match(response.body, '<h1>Server Error:</h1>')
})

test('__client custom not found', async assert => {
  assert.plan(3)

  process.env.FOO = 'hi'

  request.url = '/__client'

  const options = { clients: [], root: process.cwd(), index: 'index.html', client: '/test/fixtures/wrong.path', verbose: false }

  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.equal(response.statusCode, 404)
  assert.equal(response.headers['content-type'], 'text/html')
  assert.ok(response.end.calledWith(Buffer.from(`hello world${EOL}`)))
})

test('real path', async assert => {
  assert.plan(2)

  request.url = '/test/fixtures/foo.bar'

  const options = { clients: [], root: process.cwd(), index: 'index.html', verbose: false }
  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'application/octet-stream')
})

test('html file', async assert => {
  assert.plan(3)

  request.url = '/test/fixtures/index.html'

  const options = { clients: [], root: process.cwd(), index: 'index.html', verbose: false }
  const event = require('../lib/handler')(options)
  await event(request, response)

  assert.equal(response.statusCode, 200)
  assert.equal(response.body, `<body>hello world<script type="application/javascript" src="/__client"></script></body>${EOL}`)
  assert.equal(response.headers['content-type'], 'text/html')
})

test('request data', async assert => {
  assert.plan(1)

  request.url = '/'

  const event = require('../lib/handler')(options)
  await event(request, response)

  request.emit('data', 'foo')

  assert.ok(logger.log.calledWith('%in:yellow [%d:blue] %s', 'foo'.length, 'foo'))
})

test('request error', async assert => {
  assert.plan(1)

  request.url = '/'

  const event = require('../lib/handler')(options)
  await event(request, response)

  request.emit('error', 'foo')

  assert.ok(logger.log.calledWith('%dot:red %s', 'foo'))
})
