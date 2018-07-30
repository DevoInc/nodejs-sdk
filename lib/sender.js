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
    this._socket.on('error', error => this.emit('error', error))
    //this._socket.unref()
  }

  /**
   * Send an event to the ingestion endpoint.
   *
   * @param {string|Buffer|Object} event message to send.
   * If an object is passed it will be converted to JSON before sending.
   * @param {function(*)} callback Optional function to invoke with (error).
   * @return true if the stream accepts more events.
   */
  send(event, callback) {
    const converted = this._convert(event)
    return this._socket.write(converted, null, error => {
      if (callback) return callback(error)
      if (error) this.emit(error)
    })
  }

  _convert(event) {
    const transformed = this._transform(event)
    //console.log('sending %s', transformed)
    if (transformed.endsWith('\n')) return transformed
    return transformed + '\n'
  }

  _transform(event) {
    //console.log('Received event %j', event)
    const bits = [
      '<' + (this._options.priority || 13) + '>' + new Date().toISOString(),
      this._options.localhost || 'localhost.localdomain',
      (this._options.tag ? this._options.tag : 'my.app') + ':',
    ]
    if (typeof event == 'string') {
      bits.push(event)
    } else if (Buffer.isBuffer(event)) {
      bits.push(String(event))
    } else {
      bits.push(JSON.stringify(event))
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
    return this._writeLines(chunk, callback)
  }

  _writeLines(buffer, callback) {
    let pos = 0
    while (pos < buffer.length) {
      let nextLine = buffer.indexOf('\n', pos)
      if (nextLine == -1) {
        nextLine = buffer.length
      }
      if (!this.send(buffer.slice(pos, nextLine))) {
        //console.log('pausing')
        if (nextLine + 1 < buffer.length) return false
        this._socket.once('drain', () => {
          //console.log('resuming')
          this._writeLines(buffer.slice(nextLine + 1), callback)
        })
        return false
      }
      pos = nextLine + 1
    }
    return callback(null)
  }

  _final(callback) {
    this._socket.end(callback)
  }
}

exports.create = (...params) => new Sender(...params)

