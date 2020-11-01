const types = [Boolean, String, Number, BigInt]

function validate (options) {
  // check options
  for (const [, type] of Object.entries(options)) {
    if (!types.includes(type)) {
      throw new Error('unsupported type')
    }
  }
}

function parse (options = {}) {
  const args = process.argv.slice(2)

  const final = {}

  validate(options)

  for (const arg of args) {
    // split --key=value
    let [name, value] = arg.split('=')

    if (options[name]) {
      const type = options[name]

      // treat as a flag
      if (type === Boolean) {
        value = value ? ['true', 'yes', '1'].includes(value.toLowerCase()) : true
      }

      // type-cast
      final[name.replace(/^-{1,2}/, '')] = type(value)
    }
  }

  return final
}

module.exports = {
  validate,
  parse
}
