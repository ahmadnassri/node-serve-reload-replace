// internals
const { Server } = require('http')

// packages
const { watch } = require('chokidar')

// lib
const { expandTilde } = require('./path-utils')
const { log } = require('./log')
const request = require('./handler')
const sse = require('./sse')

class SRR {
  #options = {}
  #clients = {}
  #instance = null

  constructor ({ verbose = false, root = process.cwd(), index = 'index.html', client } = {}) {
    this.#instance = new Server()
    this.#options = { verbose, root, index, client }

    this.#clients = {}

    // watch for file changes
    const cwd = expandTilde(root)
    const watcher = watch('.', { cwd, ignoreInitial: true })

    watcher.on('all', sse(this.#clients))

    /* istanbul ignore next */
    watcher.on('ready', () => log('%dot:green Watching files in %s:yellow', cwd))

    this.#instance.on('error', err => {
      log('%dot:red %s', err.toString())
      this.exit()
    })

    this.#instance.on('listening', () => log('%dot:green Listening on %s:yellow %d:red', this.#instance.address().address, this.#instance.address().port))
    this.#instance.on('close', async () => {
      log('%dot:red Server Stopped')

      // close chokidar
      await watcher.close()
    })

    // main handler
    this.#instance.on('request', request({ client, clients: this.#clients, root, index, verbose }))
  }

  start ({ address = '0.0.0.0', port = 8080 } = {}) {
    this.#instance.listen(port, address)

    process.on('SIGTERM', this.exit.bind(this))
    process.on('SIGINT', this.exit.bind(this))
  }

  exit (signal) {
    /* istanbul ignore next */
    if (signal) log('%dot:red %s received', signal)

    // close all open connections
    /* istanbul ignore next */
    Object.entries(this.#clients).forEach(([id, response]) => {
      log('%dot:red closing connection to client: %s:dim', id)

      response.end()
    })

    /* istanbul ignore next */
    this.#instance.close(() => {
      if (signal) process.exit(0)
    })
  }

  /* istanbul ignore next */
  stop () {
    this.exit()
  }
}

module.exports = SRR
