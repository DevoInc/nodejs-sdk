'use strict';

require('should');
const fs = require('fs');
const net = require('net');
const tls = require('tls');
const { Readable } = require('stream')
const senderLib = require('../lib/sender.js');

const localPort = 7682
const messageString = 'I am Groot'
const messageObject = {message: messageString, note: 'hi'}
const year = new Date().getFullYear()
const insecureOptions = {
  host: 'localhost',
  port: localPort,
  tag: 'siem.logtrust.test.movida',
}
const serverOptions = {
  ...insecureOptions,
  cert: fs.readFileSync(__dirname + '/keys/server.crt'),
  key: fs.readFileSync(__dirname + '/keys/server.key'),
  ca: fs.readFileSync(__dirname + '/keys/ca.crt'),
  requestCert: true,
}
const clientOptions = {
  ...insecureOptions,
  cert: fs.readFileSync(__dirname + '/keys/client.crt'),
  key: fs.readFileSync(__dirname + '/keys/client.key'),
  ca: fs.readFileSync(__dirname + '/keys/ca.crt'),
}

/*
describe('Event sender (clear)', () => {

  let server;

  beforeEach(async() => {
    server = await new TestServer(insecureOptions)
  })

  afterEach(() => {
    server.close()
  })

  it('sends multiple events', done => {
    const sender = senderLib.create(insecureOptions)
    sender.on('error', done)
    sender.send(messageString)
    server.waitFor('data', data => {
      String(data).should.containEql(messageString)
      String(data).should.containEql(year)
      String(data).should.containEql(insecureOptions.tag + ':')
      sender.send(messageObject)
      server.waitFor('data', data => {
        String(data).should.containEql(messageString)
        String(data).should.containEql('{')
        String(data).should.containEql('}')
        String(data).should.containEql('hi')
        String(data).should.containEql(year)
        sender.end()
        done()
      })
    })
  })

  it('sends using RFC 5424', done => {
    const pid = 2834
    const sender = senderLib.create({
      ...insecureOptions,
      rfc5424: true,
      pid,
    });
    sender.on('error', done)
    sender.send(messageString)
    server.waitFor('data', data => {
      //console.log('data %s', data);
      String(data).should.containEql(messageString)
      String(data).should.containEql(year)
      String(data).should.containEql(pid)
      String(data).should.containEql(insecureOptions.tag + ' ')
      sender.end()
      done()
    })
  })

  it('sends string to stream', done => {
    const sender = senderLib.create(insecureOptions)
    sender.on('error', done)
    sender.write(messageString)
    server.waitFor('data', data => {
      String(data).should.containEql(messageString)
      String(data).should.containEql(year)
      sender.end()
      done()
    })
  })

  it('sends strings to blocking stream', done => {
    const sender = senderLib.create(insecureOptions)
    sender.on('error', done)
    sendUntilFull(sender, rounds => {
      let received = 0
      server.on('data', data => {
        const message = String(data)
        message.should.containEql(messageString)
        message.should.containEql(year)
        received += message.split(messageString).length - 1
        if (received == rounds) {
          sender.end()
          done()
        }
      })
    })
  })

  it('sends object to stream', done => {
    const sender = senderLib.create({
      ...insecureOptions,
      objectMode: true,
    })
    sender.on('error', done)
    sender.write(messageObject)
    server.waitFor('data', data => {
      String(data).should.containEql(messageString)
      String(data).should.containEql('{')
      String(data).should.containEql('}')
      String(data).should.containEql('hi')
      String(data).should.containEql(year)
      sender.end()
      done()
    })
  })
  it('sends with hex encoding', done => {
    const sender = senderLib.create(insecureOptions)
    sender.write('656565', 'hex')
    server.waitFor('data', data => {
      String(data).should.containEql('eee')
      sender.end()
      done()
    })
  })
})*/

describe('', () => {
  let server;

  before(async() => {
    server = await new TestServer(insecureOptions)
  })

  after( async() => {
    console.log('AFTER')
    server.close()
    //server.endSC()
  })

  it('sends TLS to insecure', done => {
    const sender = senderLib.create(clientOptions)
    for (let i = 0; i < 1; i++) {
      sender.send(messageString)
    }
    server.waitFor('close', () => {
      console.log('close');
    });
    server.waitFor('data', data => {
      console.log('wait data');
      // 0: TLS record type: handshake (22)
      data[0].should.equal(22)
      // 1,2: major-minor version, TLS 1.0 is 3,1
      data[1].should.equal(3)
      //server.endSC()
      sender.end()
      done()
      console.log('FIN')
    })
  })
});

/*describe('Event sender (secure)', () => {

  let server;

  before(async() => {
    server = await new TestServer(serverOptions)
  })

  after(() => {
    server.close()
  })

  it('sends on TLS', done => {
    const sender = senderLib.create(clientOptions)
    sender.on('error', done)
    sender.send(messageString)
    server.waitFor('data', data => {
      String(data).should.containEql(messageString)
      String(data).should.containEql(year)
      sender.send(messageObject)
      server.waitFor('data', data => {
        String(data).should.containEql(messageString)
        String(data).should.containEql('{')
        String(data).should.containEql('}')
        String(data).should.containEql('hi')
        String(data).should.containEql(year)
        sender.end()
        done()
      })
    })
  })

  it('sends insecurely to TLS', done => {
    const sender = senderLib.create(insecureOptions)
    for (let i = 0; i < 1000; i++) {
      sender.send(messageString)
    }
    sender.on('error', error => {
      error.code.should.equal('ECONNRESET')
      done()
    })
  })
})*/

class TestServer {
  constructor(options) {
    return new Promise((ok, ko) => {
      const libnet = options.cert ? tls : net
      this._server = libnet.createServer(options, socket => {
        this._socket = socket
        this._socket.on('error', error => this.emit(error))
      })
      this._server.on('error', error => ko(error))
      this._server.unref()
      this._server.listen(options.port, () => ok(this))
    })
  }

  waitFor(event, handler) {
    if (this._socket) {
      return this._socket.once(event, handler)
    }
    setImmediate(() => this.waitFor(event, handler))
  }

  on(event, handler) {
    if (this._socket) {
      return this._socket.on(event, handler)
    }
    setImmediate(() => this.on(event, handler))
  }

  close() {
    this._server.close()
  }

  endSC() {
    this._socket.end();
    this._server.close()
  }
}

class messageReadable extends Readable {
  constructor(options) {
    super(options)
    this.rounds = 0
    this._repetitions = 10
    const line = messageString + '\n'
    this._message = line.repeat(this._repetitions)
    this.active = true
  }

  _read(size) {
    if (!this.active) return
    this.push(this._message)
    this.rounds += this._repetitions
  }
}

function sendUntilFull(sender, callback) {
  const readable = new messageReadable()
  readable.pipe(sender)
  const interval = setInterval(() => {
    if (readable.isPaused()) {
      readable.active = false
      clearInterval(interval)
      return callback(readable.rounds)
    }
  }, 1)
}

