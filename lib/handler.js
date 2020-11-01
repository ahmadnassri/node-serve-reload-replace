const { readFile } = require('fs').promises

const { log } = require('./log')
const { parse } = require('./parse')
const { urlToPath } = require('./path-utils')

const headerFormat = headers => {
  return Object.keys(headers).map(() => '%s:gray: %s:dim').join(' ')
}

module.exports = function ({ client, clients, root, index, verbose }) {
  return async (request, response) => {
    if (verbose) {
      // log request
      log('%in:yellow HTTP/%s:dim %s:white %s:yellow', request.httpVersion, request.method, request.url)

      log(`%in:yellow ${headerFormat(request.headers)}`, ...request.rawHeaders)

      request.on('data', (data) => log('%in:yellow [%d:blue] %s', data.length, data.toString()))
    }

    request.on('error', (err) => log('%dot:red %s', err.toString()))

    // special path for SSE
    if (request.url === '/__events') {
      response.writeHead(200, {
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store'
      })

      const id = Date.now()

      log('%dot:yellow SSE Client Connected: %s:dim', id)

      // store the response object to send SSE later
      clients[id] = response

      request.on('close', () => {
        log('%dot:yellow SSE Client Disconnected : %s:dim', id)

        // forget this client
        delete clients[id]
      })

      // stop processing from here
      return
    }

    try {
      if (request.url === '/__client') {
        try {
          const path = client ? urlToPath(root, `/${client}`) : urlToPath(__dirname, '/client.js')
          const script = await readFile(path)
          response.writeHead(200, { 'Content-Type': 'text/javascript' })
          response.setHeader('Cache-Control', 'no-store')
          response.end(script)
          return
        } catch (err) {
          const error = new Error(`Error Loading Client: ${err.message}`)
          error.status = 404
          error.path = client
          throw error
        }
      }

      const { path, contentType, content } = await parse(request.url, { root, index })

      if (content === undefined) {
        const error = new Error(`Not Found ${path}`)
        error.status = 404
        error.path = path
        throw error
      }

      response.statusCode = 200
      response.setHeader('Content-Type', contentType)
      response.body = content

      // inject SSE client
      if (contentType === 'text/html') {
        response.body = response.body.toString().replace('</body>', '<script type="application/javascript" src="/__client"></script></body>')
      }

      response.path = path
    } catch (error) {
      /* istanbul ignore next */
      response.statusCode = error.status || 500
      response.setHeader('Content-Type', 'text/html')
      response.body = `<h1>Server Error:</h1> <p>${error.message}<p><pre>${error.stack}</pre>`
      /* istanbul ignore next */
      response.path = error.path || 'unknown'
    }

    // write response
    response.setHeader('Content-Length', Buffer.byteLength(response.body))
    response.setHeader('Cache-Control', 'no-store')
    response.write(response.body)

    if (verbose) {
      const headers = response.getHeaders()

      // log response
      log('%out:blue %s:white %s:dim %s:blue', response.statusCode, response.statusMessage, response.path.replace(root, ''))

      // log response headers
      log(`%out:blue ${headerFormat(headers)}`, ...Object.entries(headers).flat())
    } else {
      // short log
      log('%dot:green %s:white %s:yellow ↦  %s:white %s:dim', request.method, request.url, response.statusCode, response.statusMessage)
    }

    response.end()
  }
}
