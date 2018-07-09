#!/usr/bin/env node
'use strict'

const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const clientLib = require('../lib/client.js');

//Command line options definition
const OPTION_LIST = [{
  name: 'url',
  alias: 'u',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Devo API server URL'
}, {
  name: 'credentials',
  alias: 'c',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Enter path to JSON with Devo credentials'
}, {
  name: 'apiKey',
  alias: 'k',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Enter Devo API Key (found in Administration/Credentials)'
}, {
  name: 'apiSecret',
  alias: 's',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Enter Devo API Secret (found in Administration/Credentials)'
}, {
  name: 'token',
  alias: 'o',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Enter Devo HTTP token (found in Administration/Credentials)'
}, {
  name: 'dateFrom',
  alias: 'd',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Date from in ISO-8601 format. Default value is current date'
}, {
  name: 'dateTo',
  alias: 't',
  type: String,
  typeLabel: '[underline]{String}',
  description:
    'Date to in ISO-8601 format. Default value is -1, an ongoing query'
}, {
  name: 'help',
  alias: 'h',
  type: Boolean,
  typeLabel: '',
  description: 'Show help'
}, {
  name: 'query',
  alias: 'q',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Devo query'
}, {
  name: 'queryId',
  alias: 'i',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Devo query ID'
}, {
  name: 'format',
  alias: 'f',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Format to request: csv, xslt, msgpack. Default is json'
}];

//Command line helper
const SECTIONS = [{
  header: 'Command-line tool for Devo',
  content: 'Get Devo query results'
}, {
  header: 'Options',
  optionList: OPTION_LIST
}];

runClient()


function runClient() {

  // Get command line options
  const options = getCmdLineOptions();
  if (options.help) {
    return console.log(getUsage(SECTIONS));
  }
  let credentials = null
  if (options.credentials) {
    credentials = require(options.credentials)
  } else if ((options.apiKey && options.apiSecret) || options.token) {
    credentials = options
  }
  const client = clientLib.create(credentials)
  client.query(options, (error, result) => {
    if (error ) return console.error('Could not run query: %s', error);
    console.log(result)
  })
}

/**
 * Get command line arguments
 * @returns {Object}
 */
function getCmdLineOptions() {
  return commandLineArgs(OPTION_LIST);
}

