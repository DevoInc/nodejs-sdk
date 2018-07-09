'use strict';

const helper = require('@devo/js-helper');

const CONFIG_FILE = '.devo.json'


module.exports = {
  read,
}

/**
 * Use the provided credentials.
 * If not present, read the configuration file in the home dir.
 * @param {Object} credentials Devo credentials.
 * @return {Object} parsed configuration.
 */
function read(credentials) {
  credentials = credentials || readDefault()
  return helper.config.create(credentials)
}

function readDefault() {
  const home = require('os').homedir()
  const filename = home + '/' + CONFIG_FILE
  try {
    return require(filename)
  } catch (exception) {
    console.error('Could not read default credentials from %s', filename)
    console.error('Please refer to README.md for details')
    process.exit(1)
  }
}

