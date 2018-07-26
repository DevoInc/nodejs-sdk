'use strict';

require('should');
const net = require('net');

const senderLib = require('../lib/sender.js');

const localPort = 7682
const messageString = 'I am Groot'
const messageObject = {message: messageString, note: 'hi'}
const year = new Date().getFullYear()
const options = {
  host: 'localhost',
  port: localPort,
}


describe.only('Event sender', () => {

  it('sends multiple events', done => {
    const server = new TestServer(localPort, () => {
      const sender = senderLib.create(options)
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
          server.close()
          done()
        })
      })
    })
  })

  it('sends string locally', done => {
    const server = new TestServer(localPort, () => {
      const sender = senderLib.create(options)
      sender.on('error', done)
      sender.write(messageString)
      server.waitFor('data', data => {
        String(data).should.containEql(messageString)
        String(data).should.containEql(year)
        sender.end()
        server.close()
        done()
      })
    })
  });

  it('sends object locally', done => {
    const server = new TestServer(localPort, () => {
      const sender = senderLib.create({
        ...options,
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
        server.close()
        done()
      })
    })
  })
})

class TestServer {
  constructor(port, callback) {
    this._server = net.createServer(socket => this._socket = socket)
    this._server.unref()
    this._server.listen(port, callback)
  }

  waitFor(event, handler) {
    if (this._socket) {
      return this._socket.once(event, handler)
    }
    setImmediate(() => this.waitFor(event, handler))
  }

  close() {
    this._server.close()
  }
}

