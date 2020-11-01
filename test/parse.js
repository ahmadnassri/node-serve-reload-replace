const { test } = require('tap')

const { parse } = require('../lib/parse')

test('cannot parse file path as url', async assert => {
  assert.plan(1)

  assert.rejects(() => parse('not-a-real-path'))
})

test('cannot find path on fs', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-file'), { path: '/not-a-file' })
})

test('append index on /', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-path/'), { path: '/not-a-path/index.html' })
})

test('append custom index on /', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-path/', { index: 'foo.bar' }), { path: '/not-a-path/foo.bar' })
})

test('defined root', async assert => {
  assert.plan(1)

  assert.match(await parse('/not-a-path', { root: '/foo/bar' }), { path: '/foo/bar/not-a-path' })
})

test('real path', async assert => {
  assert.plan(1)

  assert.match(await parse('/test/fixtures/index.html'), { path: '/test/fixtures/index.html' })
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

  assert.match(await parse('/test/fixtures/page.html'), { path: '/test/fixtures/page.html/index.html' })
})
