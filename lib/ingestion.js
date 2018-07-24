'use strict';


/**
 * Client for event ingestion.
 */
class Ingestion {

  /**
   * Create the client.
   * @param {String} endpoint where to send events, as host:port.
   * @param {String} certificate the TLS certificate to use.
   */
  constructor(endpoint, certificate) {
    this._endpoint = endpoint
    this._certificate = certificate
  }

  /**
   * Send an event to the ingestion endpoint.
   *
   * @param {String} event message to send.
   * @param {function(*)} callback Function to invoke with (error).
   */
  send(event, callback) {
    return callback('Not implemented yet')
  }
}

exports.create = (...params) => new Ingestion(...params)

