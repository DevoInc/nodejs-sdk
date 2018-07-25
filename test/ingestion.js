'use strict';

require('should');
const net = require('net');

const ingestionLib = require('../lib/ingestion.js');

const LOCAL_PORT = 7682
const MESSAGE = 'I am Groot'


describe.only('Data ingestion', () => {

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
      const ingestion = ingestionLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
      })
      ingestion.write(MESSAGE, error => {
        if (error) done(error)
      })
      ingestion.end()
    })
    server.unref()
  });
  it('sends string locally', done => {
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
      const ingestion = ingestionLib.create({
        host: 'localhost',
        port: LOCAL_PORT,
        objectMode: true,
      })
      ingestion.write({message: MESSAGE, note: 'hi'}, error => {
        if (error) done(error)
      })
    })
  })
})

