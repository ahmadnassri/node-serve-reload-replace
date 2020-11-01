const { test } = require('tap')
const { normalize } = require('path')
const { parse } = require('../lib/parse')

test('cannot find path on fs', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-file'), { path: normalize('/not-a-file') })
})

test('append index on /', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-path/'), { path: normalize('/not-a-path/index.html') })
})

test('append custom index on /', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-path/', { index: 'foo.bar' }), { path: normalize('/not-a-path/foo.bar') })
})

test('defined root', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-path', { root: '/foo/bar' }), { path: normalize('/foo/bar/not-a-path') })
})

test('real path', async assert => {
  assert.plan(1)

  assert.match(await parse('/test/fixtures/index.html'), { path: normalize('/test/fixtures/index.html') })
})

test('unknown mimetyle', async assert => {
  assert.plan(1)

  assert.match(await parse('/test/fixtures/foo.bar'), { contentType: 'application/octet-stream' })
})

test('read content', async assert => {
  assert.plan(1)

  assert.match(await parse('/test/fixtures/index.html'), { content: '<body>hello world</body>\n' })
})

test('traverse directory', async assert => {
  assert.plan(1)

  assert.match(await parse('/test/fixtures/page.html'), { path: normalize('/test/fixtures/page.html/index.html') })
})
