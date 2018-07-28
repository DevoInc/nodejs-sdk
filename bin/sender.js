#!/usr/bin/env node
'use strict'

const fs = require('fs');
const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const senderLib = require('../lib/sender.js');

//Command line options definition
const OPTION_LIST = [{
  name: 'file',
  alias: 'f',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'File to send; if not present send stdin',
}, {
  name: 'host',
  alias: 'h',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Devo ingestion host',
}, {
  name: 'port',
  alias: 'p',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Devo ingestion port',
}, {
  name: 'key',
  alias: 'k',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Path to Devo private key (found in Administration/Credentials)',
}, {
  name: 'cert',
  alias: 'c',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Path to Devo certificate (found in Administration/Credentials)'
}, {
  name: 'ca',
  alias: 'a',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Path to Devo CA (found in Administration/Credentials)'
}, {
  name: 'help',
  type: Boolean,
  typeLabel: '',
  description: 'Show help'
}];

//Command line helper
const SECTIONS = [{
  header: 'Command-line sender for Devo',
  content: 'Send events to Devo'
}, {
  header: 'Options',
  optionList: OPTION_LIST
}];

runSender()


function runSender() {

  // Get command line options
  const options = getCmdLineOptions();
  if (options.help) {
    return console.log(getUsage(SECTIONS));
  }
  const params = {...options}
  if (options.cert) params.cert = fs.readFileSync(options.cert)
  if (options.key) params.key = fs.readFileSync(options.key)
  if (options.ca) params.ca = fs.readFileSync(options.ca)
  const sender = senderLib.create(params)
  let input = process.stdin
  if (options.file) {
    input = fs.createReadStream(options.file)
  }
  input.pipe(sender)
}

/**
 * Get command line arguments
 * @returns {Object}
 */
function getCmdLineOptions() {
  return commandLineArgs(OPTION_LIST);
}

