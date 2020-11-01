// internals
const { Server } = require('http')

// packages
const { watch } = require('chokidar')

// lib
const { log } = require('./log')
const request = require('./handler')
const sse = require('./sse')
const { expandTilde } = require('./path-utils')

module.exports = function ({ address = '0.0.0.0', port = 8080, verbose = false, root = process.cwd(), index = 'index.html', client } = {}) {
  const clients = {}
  const server = new Server()

  // watch for file changes
  const cwd = expandTilde(root)
  const watcher = watch('.', { cwd, ignoreInitial: true })

  watcher.on('all', sse(clients))

  /* istanbul ignore next */
  watcher.on('ready', () => log('%dot:green Watching files in %s:yellow', cwd))

  server.on('close', async () => {
    log('%dot:red Stopped Listening')

    // close chokidar
    await watcher.close()
  })
  server.on('error', err => log('%dot:red %s', err.toString()))
  server.on('listening', () => log('%dot:green Listening on %s:yellow %d:red', server.address().address, server.address().port))

  // main handler
  server.on('request', request({ client, clients, root, index, verbose }))

  server.listen(port, address)
}
