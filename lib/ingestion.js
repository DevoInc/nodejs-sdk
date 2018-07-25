'use strict';

const net = require('net')
const { Writable } = require('stream')


/**
 * Client for event ingestion.
 * Can be used as a stream.
 * Implements backpressure.
 */
class Ingestion extends Writable {

  /**
   * Create the client.
   * @param {Object} endpoint where to send events, as host:port.
   * @param {function(*)} callback (Optional) Function to invoke when the
   * connection has been established.
   */
  constructor(options, callback) {
    super(options)
    this._options = options
    this._socket = net.connect(options, callback)
    this._socket.unref()
    this._buffer = []
  }

  /**
   * Write an event to the ingestion endpoint.
   *
   * @param {String} event message to send.
   * @param {function(*)} callback Function to invoke with (error).
   */
  _write(chunk, encoding, callback) {
    callback = callback || console.error
    const event = this._convert(chunk, encoding)
    return this._socket.write(event, null, callback)
  }

  _convert(chunk, encoding) {
    const timestamp = new Date().toISOString()
    //console.log('Received chunk %j', chunk)
    if (typeof chunk == 'string') {
      return timestamp.toISOString() + ': ' + chunk
    } else if (Buffer.isBuffer(chunk)) {
      return timestamp + ': ' + String(chunk)
    }
    return timestamp + ': ' + JSON.stringify(chunk)
  }
}

exports.create = (...params) => new Ingestion(...params)

