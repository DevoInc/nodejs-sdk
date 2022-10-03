'use strict';

module.exports = {
  client: require('./lib/client.js').create,
  sender: require('./lib/sender.js').create,
};

