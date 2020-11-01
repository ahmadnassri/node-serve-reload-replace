// keep this stubbable
const { extname } = require('path')
const { lstat, readFile } = require('fs/promises')

const ssi = require('../lib/ssi')
const { urlToPath } = require('./path-utils')

const mimeTypes = {
  css: 'text/css',
  eot: 'application/vnd.ms-fontobject',
  gif: 'image/gif',
  html: 'text/html',
  jpg: 'image/jpg',
  js: 'text/javascript',
  json: 'application/json',
  mp4: 'video/mp4',
  otf: 'application/font-otf',
  png: 'image/png',
  svg: 'image/svg+xml',
  ttf: 'application/font-ttf',
  txt: 'text/plain',
  wasm: 'application/wasm',
  wav: 'audio/wav',
  woff: 'application/font-woff'
}

async function parse (path, { root = process.cwd(), index = 'index.html' } = {}) {
  path = urlToPath(root, path, index)

  let stats

  // analyze path
  try {
    stats = await lstat(path)
  } catch (error) {
    // exit early
    return { path }
  }

  // determine if a directory
  if (stats.isDirectory()) {
    // append '/' to treat as a path
    path = path + '/'

    // exit early
    return parse(path.replace(root, ''), { root, index })
  }

  // 404
  /* istanbul ignore next */
  if (!stats.isFile()) {
    return { path }
  }

  // determine file extension
  const ext = extname(path).replace(/^\.{1}/, '')

  const contentType = mimeTypes[ext] || 'application/octet-stream'

  let content = await readFile(path)

  // process SSI
  if (contentType === 'text/html') content = ssi(content.toString())

  return { path, content, contentType }
}

module.exports = {
  parse,
  mimeTypes
}
