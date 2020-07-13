'use strict';

const net = require('net')
const tls = require('tls')
const { Writable } = require('stream')
const version = require('../package.json').version;

const RELP_RSP_REGEX = /^([0-9]+) rsp ([0-9]+)/i;

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
   *  - relp: use RELP protocol, a 'rsp' event will be emitted for each response
   *  - insecure: accept invalid certificates. Warning: only for experimental
   *  usage.
   * @param {function(*)} callback (Optional) Function to invoke when the
   * connection has been established.
   */
  constructor(options, callback) {
    super(options)
    options.rejectUnauthorized = !options.insecure
    this._options = options
    this._relp = {
      enabled: this._options.relp === true,
      txno: 0,
      buffer: '',
      openTxno: null,
      closeTxno: null
    };
    const libnet = options.cert ? tls : net
    this._socket = libnet.connect(options, callback)
    this._socket.on('error', error => this.emit('error', error))
    if (this._relp.enabled) {
      this._socket.on('data', data => this._onData(data));
      this._sendRelpOpen();
    }
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
    if (this._options.debug) {
      console.log('%s', converted.trim());
    }
    const writeRes = this._socket.write(
      converted, error => this._handleError(error, callback));
    return this._relp.enabled ? writeRes && this._relp.txno : writeRes;
  }

  resend(message, txno, callback) {
    if (!this._relp.enabled) {
      callback(new Error('resend only supported with a RELP sender'));
      return false;
    }
    const converted = this._convert(message, txno)
    if (this._options.debug) {
      console.log('%s', converted.trim());
    }
    const writeRes = this._socket.write(
      converted, error => this._handleError(error, callback));
    return writeRes && this._txno;
  }

  sendClose(callback) {
    if (!this._relp.enabled) {
      callback(new Error('sendClose only supported with a RELP sender'));
      return false;
    }
    this._relp.closeTxno = this._nextRelpTxno();
    const converted = `${this._relp.closeTxno} close 3 bye\n`;
    if (this._options.debug) {
      console.log('%s', converted.trim());
    }
    const writeRes = this._socket.write(
      converted, error => this._handleError(error, callback));
    return writeRes && this._relp.closeTxno;
  }

  _sendRelpOpen() {
    const message = `relp_version=0
relp_software=@devo/nodejs-sdk,${version},http://devo.com
commands=syslog`;
    this._relp.openTxno = this._nextRelpTxno();
    const converted =
      `${this._relp.openTxno} open ${message.length} ${message}\n`;
    if (this._options.debug) {
      console.log('%s', converted.trim());
    }
    this._socket.write(converted);
  }

  _onData(data) {
    // pre: this._relp.enabled === true
    this._relp.buffer += data.toString();
    this._extractRsps();
  }

  _extractRsps() {
    let m;
    while((m = this._relp.buffer.match(RELP_RSP_REGEX))) {
      const txno = Number(m[1]);
      const length = Number(m[2]);
      const bodyStart = m[0].length + 1;
      if(this._relp.buffer.length < bodyStart + length + 1) {
        // next message is not complete, wait until more data arrives
        break;
      }
      const body = this._relp.buffer.substring(bodyStart, bodyStart+length);
      this._emitRsp(txno, body);
      this._relp.buffer = this._relp.buffer.substring(bodyStart+length+1);
    }
  }

  _emitRsp(txno, body) {
    let command = 'syslog';
    if(txno === this._relp.openTxno)
      command = 'open';
    else if(txno === this._relp.closeTxno)
      command = 'close';

    this.emit('rsp', {txno, command, body});
  }

  _nextRelpTxno() {
    if (this._relp.txno === 999999999) this._relp.txno = 0;
    return ++this._relp.txno;
  }

  unref() { this._socket.unref(); }

  _handleError(error, callback) {
    if (typeof error == 'string') {
      error = new Error(error)
    }
    if (callback) return callback(error)
    if (error) this.emit(error)
  }

  _convert(message, txno = null) {
    const transformed = this._transform(message, txno)
    return transformed;
  }

  /**
   * Generates an event that conforms to RFC 5424:
   * https://tools.ietf.org/html/rfc5424
   */
  _transform(message, txno) {
    const bits = this._getBits();
    let strMessage;
    if (typeof message == 'string') {
      strMessage = message;
    } else if (Buffer.isBuffer(message)) {
      strMessage = String(message);
    } else {
      strMessage = JSON.stringify(message);
    }
    if (!strMessage.endsWith('\n')) strMessage += '\n';
    bits.push(strMessage);

    const transformed = bits.join(' ');

    return this._relp.enabled
      ? `${txno || this._nextRelpTxno()} syslog ${transformed.length-1} \
${transformed}`
      : transformed;
  }

  _getBits() {
    const priority = this._options.priority || 13
    const date = new Date().toISOString()
    const host = this._options.localhost || 'localhost.localdomain'
    const tag = this._options.tag ? this._options.tag : 'my.app'
    if (!this._options.rfc5424) {
      return [
        '<' + priority + '>' + date,
        host,
        tag + ':',
      ]
    }
    return [
      '<' + priority + '>1',
      date,
      host,
      tag,
      this._options.pid || process.pid,
      this._options.worker || 'master',
      '-',
    ];
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
        if (nextLine + 1 >= buffer.length) return setImmediate(callback)
        this._socket.once('drain', () => {
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

