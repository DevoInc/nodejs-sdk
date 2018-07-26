'use strict';

const net = require('net')
const tls = require('tls')
const { Writable } = require('stream')


/**
 * Event sender.
 * Can be used as a stream, with the usual functions:
 * sender.write(), sender.end(), etc.
 * Implements backpressure.
 */
class Sender extends Writable {

  /**
   * Create the client.
   * @param {Object} options for sender, including:
   *  - host: the host to send events, default localhost.
   *  - port: the destination port (mandatory).
   *  - objectMode: whether to allow sending objects.
   * @param {function(*)} callback (Optional) Function to invoke when the
   * connection has been established.
   */
  constructor(options, callback) {
    super(options)
    this._options = options
    const libnet = options.cert ? tls : net
    this._socket = libnet.connect(options, callback)
    this._socket.unref()
  }

  /**
   * Send an event to the ingestion endpoint.
   *
   * @param {string|Buffer|Object} event message to send.
   * If an object is passed it will be converted to JSON before sending.
   * @param {function(*)} callback Optional function to invoke with (error).
   */
  send(event, callback) {
    callback = callback || console.error
    const converted = this._convert(event)
    return this._socket.write(converted, null, callback)
  }

  _convert(event) {
    const timestamp = new Date().toISOString()
    //console.log('Received event %j', event)
    if (typeof event == 'string') {
      return timestamp + ': ' + event
    } else if (Buffer.isBuffer(event)) {
      return timestamp + ': ' + String(event)
    }
    return timestamp + ': ' + JSON.stringify(event)
  }

  _write(chunk, encoding, callback) {
    if (encoding && encoding != 'utf8') {
      chunk = Buffer.from(chunk, encoding)
    }
    this.send(chunk, callback)
  }
}

exports.create = (...params) => new Sender(...params)

