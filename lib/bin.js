#!/usr/bin/env node

const chalk = require('chalk')

const { parse } = require('./args')
const server = require('./server')

const options = {
  '--address': String,
  '--client': String,
  '--help': Boolean,
  '--index': String,
  '--port': String,
  '--root': String,
  '--verbose': Boolean
}

const usage = `Usage: srr [options]
  ${chalk.yellow('--root')}     Path to serve & watch                                 default: $PWD
  ${chalk.yellow('--client')}   Path to custom EventSource client                     default: built-in
  ${chalk.yellow('--address')}  Specify network interface to use                      default: 0.0.0.0
  ${chalk.yellow('--port')}     Specify a port to use                                 default: 8080
  ${chalk.yellow('--index')}    Specify which file should be used as the index page   default: index.html
  ${chalk.yellow('--verbose')}  Verbose logging                                       default: false
  ${chalk.yellow('--help')}     Display Help
`

const args = parse(options)

if (args.help) {
  console.log(usage)
  process.exit(0)
}

server(args)
