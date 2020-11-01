const { log } = require('./log')

module.exports = function (clients, passThrough = false) {
  return (event, path) => {
    log('%dot:yellow %s:dim %s:blue', event, path)

    Object.values(clients).forEach(response => {
      response.write(`event: ${event}\ndata: ${path}\n\n`)
      response.write(`event: all\ndata: ${path}\n\n`)
    })
  }
}
