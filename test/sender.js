'use strict';

require('should');
const net = require('net');

const senderLib = require('../lib/sender.js');

const LOCAL_PORT = 7682
const MESSAGE = 'I am Groot'


describe.only('Event sender', () => {

  it('sends string locally', done => {
    const server = net.createServer(socket => {
      socket.on('data', data => {
        const string = String(data)
        string.should.containEql(MESSAGE)
        server.close()
        done()
      })
    })
    server.listen(LOCAL_PORT, () => {
      const sender = senderLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
      })
      sender.write(MESSAGE, error => {
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
        string.should.containEql(MESSAGE)
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
      sender.write({message: MESSAGE, note: 'hi'}, error => {
        if (error) done(error)
      })
    })
  })
})

