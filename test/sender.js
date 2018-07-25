'use strict';

require('should');
const net = require('net');

const senderLib = require('../lib/sender.js');

const LOCAL_PORT = 7682
const MESSAGE_STRING = 'I am Groot'
const MESSAGE_OBJECT = {message: MESSAGE_STRING, note: 'hi'}
const YEAR = new Date().getFullYear()


describe.only('Event sender', () => {

  it('sends multiple events', done => {
    const server = new TestServer(LOCAL_PORT, () => {
      const sender = senderLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
      })
      sender.on('error', done)
      sender.send(MESSAGE_STRING)
      server.waitFor('data', data => {
        String(data).should.containEql(MESSAGE_STRING)
        String(data).should.containEql(YEAR)
        sender.send(MESSAGE_OBJECT)
        server.waitFor('data', data => {
          String(data).should.containEql(MESSAGE_STRING)
          String(data).should.containEql('{')
          String(data).should.containEql('}')
          String(data).should.containEql('hi')
          String(data).should.containEql(YEAR)
          sender.end()
          server.close()
          done()
        })
      })
    })
  })

  it('sends string locally', done => {
    const server = new TestServer(LOCAL_PORT, () => {
      const sender = senderLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
      })
      sender.on('error', done)
      sender.write(MESSAGE_STRING)
      server.waitFor('data', data => {
        String(data).should.containEql(MESSAGE_STRING)
        String(data).should.containEql(YEAR)
        sender.end()
        server.close()
        done()
      })
    })
  });

  it('sends object locally', done => {
    const server = new TestServer(LOCAL_PORT, () => {
      const sender = senderLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
        objectMode: true,
      })
      sender.on('error', done)
      sender.write(MESSAGE_OBJECT)
      server.waitFor('data', data => {
        String(data).should.containEql(MESSAGE_STRING)
        String(data).should.containEql('{')
        String(data).should.containEql('}')
        String(data).should.containEql('hi')
        String(data).should.containEql(YEAR)
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

