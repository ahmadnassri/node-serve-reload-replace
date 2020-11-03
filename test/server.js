const http = require('http')
const { EventEmitter } = require('events')

const chokidar = require('chokidar')
const { test, beforeEach, afterEach } = require('tap')
const { stub, fake } = require('sinon')

const logger = require('../lib/log')

let watch

let fakeHTTPInstance

class fakeHTTP extends EventEmitter {
  constructor () {
    super()

    fakeHTTPInstance = this
  }

  address () {
    return {
      address: 'address',
      port: 'port'
    }
  }
}

// overwrite http.Server taking advantage of require cache
http.Server = fakeHTTP
logger.log = stub()

beforeEach(done => {
  watch = stub(chokidar, 'watch').returns(({ on: fake(), close: fake() }))

  // fake methods
  fakeHTTP.prototype.listen = fake()

  done()
})

afterEach(done => {
  logger.log.resetHistory()

  watch.restore()

  done()
})

test('listens on default address', async assert => {
  assert.plan(1)

  require('../lib/server')()

  assert.true(fakeHTTP.prototype.listen.calledWith(8080, '0.0.0.0'))
})

test('listens on custom address', async assert => {
  assert.plan(1)

  require('../lib/server')({ port: 1234, address: '1.1.1.1' })

  assert.true(fakeHTTP.prototype.listen.calledWith(1234, '1.1.1.1'))
})

test('log server events', async assert => {
  assert.plan(3)

  require('../lib/server')()

  fakeHTTPInstance.emit('error', 'foo')
  fakeHTTPInstance.emit('listening')
  fakeHTTPInstance.emit('close')

  assert.true(logger.log.calledWith('%dot:red %s', 'foo'))
  assert.true(logger.log.calledWith('%dot:red Server Stopped'))
  assert.true(logger.log.calledWith('%dot:green Listening on %s:yellow %d:red', 'address', 'port'))
})
