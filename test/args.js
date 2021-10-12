const tap = require('tap')
const { createSandbox } = require('sinon')

const { parse } = require('../lib/args.js')

const sandbox = createSandbox()

tap.beforeEach(() => {
  sandbox.stub(process, 'argv').value([0, 0, '--foo=bar', '--bool', '--flag=no'])
})

tap.afterEach(() => {
  sandbox.restore()
})

tap.test('no options', assert => {
  assert.plan(1)

  const args = parse()

  assert.match(args, {})
})

tap.test('no match', assert => {
  assert.plan(1)

  const args = parse({ '--not-an-arg': String })

  assert.match(args, {})
})

tap.test('wrong type', assert => {
  assert.plan(1)

  assert.throws(() => parse({ '--foo': Object }), new Error('unsupported type'))
})

tap.test('strings argument', assert => {
  assert.plan(1)

  const args = parse({ '--foo': String })

  assert.match(args, { foo: 'bar' })
})

tap.test('boolean argument', assert => {
  assert.plan(1)

  const args = parse({ '--bool': Boolean, '--flag': Boolean })

  assert.match(args, { bool: true, flag: false })
})
