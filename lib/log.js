const logger = require('oh-my-log')

const log = logger('server', {
  prefix: '[%__date:magenta]',
  locals: {
    dot: '•',
    in: '↦',
    out: '↤'
  }
})

module.exports = {
  log
}
