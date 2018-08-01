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
  const env = {
    apiKey: process.env.DEVO_KEY,
    apiSecret: process.env.DEVO_SECRET,
    token: process.env.DEVO_TOKEN,
    url: process.env.DEVO_URL,
  }
  const home = require('os').homedir()
  const filename = home + '/' + CONFIG_FILE
  try {
    const read = require(filename)
    Object.keys(env).forEach(key => {
      if (env[key]) read[key] = env[key]
    })
    return read
  } catch (exception) {
    if (env.url && (env.apiKey || env.token)) {
      return env
    }
    console.error('Could not read credentials from process env or from %s',
      filename)
    console.error('Please refer to README.md for details')
    process.exit(1)
  }
}

