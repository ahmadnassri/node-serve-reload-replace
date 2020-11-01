const os = require('os')
const { join } = require('path')

function expandTilde (path) {
  const home = os.homedir()

  if (path.charCodeAt(0) === 126) { // ~
    if (path.charCodeAt(1) === 43) { // +
      return join(process.cwd(), path.slice(2))
    }

    return home ? join(home, path.slice(1)) : path
  }

  return path
}

function urlToPath (root, path, index) {
  // expand ~ + paths
  root = expandTilde(root)

  // when traversing root, or a directory, look for index.html
  path = path.endsWith('/') ? path + index : path

  // construct absolute path
  path = join(root, '.', path)

  return path
}

module.exports = {
  urlToPath,
  expandTilde
}
