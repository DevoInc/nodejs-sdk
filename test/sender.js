'use strict';

require('should');
const net = require('net');

const senderLib = require('../lib/sender.js');

const LOCAL_PORT = 7682
const MESSAGE_STRING = 'I am Groot'
const MESSAGE_OBJECT = {message: MESSAGE_STRING, note: 'hi'}


describe.only('Event sender', () => {

  it('sends multiple events', done => {
    const server = net.createServer(socket => {
      socket.on('data', data => {
        const string = String(data)
        string.should.containEql(MESSAGE_STRING)
        server.close()
        done()
      })
    })
    server.listen(LOCAL_PORT, () => {
      const sender = senderLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
      })
      sender.send(MESSAGE_STRING, error => {
        if (error) done(error)
      })
      sender.send(MESSAGE_OBJECT, error => {
        if (error) done(error)
      })
      sender.end()
    })
    server.unref()
  })

  it('sends string locally', done => {
    const server = net.createServer(socket => {
      socket.on('data', data => {
        const string = String(data)
        string.should.containEql(MESSAGE_STRING)
        server.close()
        done()
      })
    })
    server.listen(LOCAL_PORT, () => {
      const sender = senderLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
      })
      sender.write(MESSAGE_STRING, error => {
        if (error) done(error)
      })
      sender.end()
    })
    server.unref()
  });
  it('sends object locally', done => {
    const server = net.createServer(socket => {
      socket.on('data', data => {
        const string = String(data)
        string.should.containEql(MESSAGE_STRING)
        string.should.containEql('{')
        string.should.containEql('}')
        string.should.containEql('hi')
        server.close()
        done()
      })
    })
    server.listen(LOCAL_PORT, () => {
      const sender = senderLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
        objectMode: true,
      })
      sender.write(MESSAGE_OBJECT, error => {
        if (error) done(error)
      })
    })
  })
})

