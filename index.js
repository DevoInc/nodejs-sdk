'use strict';

module.exports = {
  client: require('./lib/client.js').create,
  ingestion: require('./lib/ingestion.js').create,
}

