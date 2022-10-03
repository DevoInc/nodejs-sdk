#!/usr/bin/env node
'use strict';

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
  name: 'key',
  alias: 'k',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Enter Devo API Key (found in Administration/Credentials)'
}, {
  name: 'secret',
  alias: 's',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Enter Devo API Secret (found in Administration/Credentials)'
}, {
  name: 'token',
  alias: 'o',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Enter Devo API token (found in Administration/Credentials)'
}, {
  name: 'from',
  alias: 'f',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Date from in ISO-8601 format. Default value is current date'
}, {
  name: 'to',
  alias: 't',
  type: String,
  typeLabel: '[underline]{String}',
  description:
    'Date to in ISO-8601 format. Default value is -1, an ongoing query'
}, {
  name: 'query',
  alias: 'q',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Devo query'
}, {
  name: 'id',
  alias: 'i',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Devo query ID'
}, {
  name: 'format',
  alias: 'm',
  type: String,
  typeLabel: '[underline]{String}',
  description: 'Format to request: csv, xslt, msgpack. Default is json'
}, {
  name: 'skip',
  type: Number,
  typeLabel: '[underline]{Number}',
  description: 'Skip these registers from the beginning of the query'
}, {
  name: 'limit',
  type: Number,
  typeLabel: '[underline]{Number}',
  description: 'Return only these registers'
}, {
  name: 'help',
  alias: 'h',
  type: Boolean,
  typeLabel: '',
  description: 'Show help'
}];

//Command line helper
const SECTIONS = [{
  header: 'Command-line tool for Devo',
  content: 'Get Devo query results'
}, {
  header: 'Options',
  optionList: OPTION_LIST
}];

runClient();


function runClient() {

  // Get command line options
  const options = getCmdLineOptions();
  if (options.help) {
    return console.log(getUsage(SECTIONS));
  }
  let credentials = null;
  // with no credentials options use ~/.devo.json
  if (options.credentials) {
    credentials = require(options.credentials);
    console.log('cred %j', credentials);
  } else if ((options.key && options.secret) || options.token) {
    credentials = {
      url: options.url,
      apiKey: options.key,
      apiSecret: options.secret,
      apiToken: options.token,
    };
  }
  const client = clientLib.create(credentials);
  const queryOptions = {
    dateFrom: options.from,
    dateTo: options.to,
    query: options.query,
    queryId: options.id || options.queryId,
    format: options.format,
    skip: options.skip,
    limit: options.limit,
  };
  client.query(queryOptions, (error, result) => {
    if (error ) return console.error('Could not run query: %s', error);
    console.log(result);
  });
}

/**
 * Get command line arguments
 * @returns {Object}
 */
function getCmdLineOptions() {
  return commandLineArgs(OPTION_LIST);
}

