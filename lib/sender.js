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
   *  - host: host to send events, optional.
   *  - port: destination port, mandatory.
   *  - cert: to send securely.
   *  - key: to send securely.
   *  - ca: certificate authority for cert.
   *  - objectMode: whether to allow sending objects.
   * @param {function(*)} callback (Optional) Function to invoke when the
   * connection has been established.
   */
  constructor(options, callback) {
    super(options)
    this._options = options
    const libnet = options.cert ? tls : net
    this._socket = libnet.connect(options, callback)
    this._socket.on('error', error => this.emit('error', error))
  }

  /**
   * Send an event to the ingestion endpoint.
   *
   * @param {string|Buffer|Object} message payload of the event to send.
   * If an object is passed it will be converted to JSON before sending.
   * @param {function(*)} callback Optional function to invoke with (error).
   * @return true if the stream accepts more events.
   */
  send(message, callback) {
    const converted = this._convert(message)
    return this._socket.write(converted, null,
      error => this._handleError(error, callback))
  }

  _handleError(error, callback) {
    if (typeof error == 'string') {
      error = new Error(error)
    }
    if (callback) return callback(error)
    if (error) this.emit(error)
  }

  _convert(message) {
    const transformed = this._transform(message)
    //console.log('sending %s', transformed)
    if (transformed.endsWith('\n')) return transformed
    return transformed + '\n'
  }

  /**
   * Generates an event that conforms to RFC 5424:
   * https://tools.ietf.org/html/rfc5424
   */
  _transform(message) {
    const bits = [
      '<' + (this._options.priority || 13) + '>' + new Date().toISOString(),
      this._options.localhost || 'localhost.localdomain',
      (this._options.tag ? this._options.tag : 'my.app') + ':',
    ]
    if (typeof message == 'string') {
      bits.push(message)
    } else if (Buffer.isBuffer(message)) {
      bits.push(String(message))
    } else {
      bits.push(JSON.stringify(message))
    }
    return bits.join(' ')
  }

  _write(chunk, encoding, callback) {
    if (typeof chunk == 'string') {
      if (encoding && encoding != 'utf8') {
        chunk = Buffer.from(chunk, encoding)
      } else {
        chunk = Buffer.from(chunk)
      }
    }
    if (!Buffer.isBuffer(chunk)) {
      chunk = Buffer.from(JSON.stringify(chunk))
    }
    this._writeLines(chunk, callback)
  }

  _writeLines(buffer, callback) {
    let pos = 0
    while (pos < buffer.length) {
      let nextLine = buffer.indexOf('\n', pos)
      if (nextLine == -1) {
        nextLine = buffer.length
      }
      if (!this.send(buffer.slice(pos, nextLine))) {
        //console.log('paused')
        if (nextLine + 1 >= buffer.length) return setImmediate(callback)
        this._socket.once('drain', () => {
          //console.log('resumed')
          this._writeLines(buffer.slice(nextLine + 1), callback)
        })
        return
      }
      pos = nextLine + 1
    }
    return setImmediate(callback)
  }

  _final(callback) {
    this._socket.end(callback)
  }
}

exports.create = (...params) => new Sender(...params)

