'use strict';

const {Transform} = require('stream');


/**
 * An object-mode stream that sends query rows as events.
 */
class QueryStream extends Transform {

  constructor() {
    super({objectMode: true});
    this._pending = '';
    this._columns = null;
  }

  _transform(chunk, encoding, callback) {
    let data;
    if (encoding == 'buffer' || Buffer.isBuffer(chunk)) {
      data = chunk.toString();
    } else {
      data = chunk;
    }
    this._pending = this._pending + data;
    this._sendPending(callback);
  }

  _flush(callback) {
    if (this._pending) {
      this._parseLine(this._pending);
    }
    callback(null);
  }

  _sendPending(callback) {
    let accepts = true;
    let pos = 0;
    while (accepts) {
      const next = this._pending.indexOf('\n', pos);
      if (next === -1) break;
      const line = this._pending.substring(pos, next);
      try {
        accepts = this._parseLine(line);
      } catch(error) {
        this._pending = this._pending.substring(next + 1);
        return callback('Could not parse: ' + error);
      }
      pos = next + 1;
    }
    this._pending = this._pending.substring(pos);
    return callback(null);
  }

  _parseLine(line) {
    if (line.trim().length === 0) return;
    const parsed = JSON.parse(line);
    if (parsed.status && parsed.status !== 0 && parsed.status !== 200) {
      if (parsed.msg) {
        this.emit('error', parsed.msg);
      } else {
        this.emit('error', 'Invalid status ' + parsed.status);
      }
      return;
    }
    if (parsed.m) {
      this._columns = Object.keys(parsed.m);
      this.emit('meta', parsed);
    } else if (parsed.d) {
      const data = {};
      this._columns.forEach((key, index) => data[key] = parsed.d[index]);
      return this.push(data);
    } else {
      this.emit('error', 'Invalid line parsed: ' + line);
    }
  }
}

exports.create = () => new QueryStream();

