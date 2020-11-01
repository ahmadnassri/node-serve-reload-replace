const { log } = require('./log')

const ssiRegex = /<!-- *#(?<directive>[a-z]+) (?<params>[a-z]+=".*?")* *-->/i
const paramsRegex = /((?<key>[a-z]+)="(?<value>[^"]*)")+/ig

module.exports = function (content) {
  const matches = content.matchAll(new RegExp(ssiRegex, 'g'))

  // iterate over matches in order
  for (const match of matches) {
    const { groups: { directive, params } } = match

    const parameters = {}

    if (params) {
      const paramsMatches = params.matchAll(paramsRegex)

      for (const paramsMatch of paramsMatches) {
        const { groups: { key, value } } = paramsMatch
        parameters[key] = value
      }
    }

    switch (directive) {
      case 'echo':
        // replace with value
        content = content.replace(ssiRegex, process.env[parameters.var] || '')
        break

      case 'printenv':
        // remove SSI
        content = content.replace(ssiRegex, JSON.stringify(process.env, null, parameters.space))
        break

      case 'set':
        // remove SSI
        content = content.replace(ssiRegex, '')

        process.env[parameters.var] = parameters.value
        break

      default:
        log('%dot:red unsupported SSI directive %s', directive)
    }
  }

  return content
}
