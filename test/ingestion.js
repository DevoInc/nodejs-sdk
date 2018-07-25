'use strict';

require('should');
const net = require('net');

const ingestionLib = require('../lib/ingestion.js');

const LOCAL_PORT = 7682
const MESSAGE = 'I am Groot'


describe.only('Data ingestion', () => {

  it('sends data locally', done => {
    const server = net.createServer(socket => {
      socket.on('data', data => {
        const string = String(data)
        string.should.contain(MESSAGE)
        done()
      })
    })
    server.listen(LOCAL_PORT, () => {
      const ingestion = ingestionLib.create('localhost:' + LOCAL_PORT)
      ingestion.send(MESSAGE, error => {
        if (error) done(new Error(error))
      })
    })
  });
});

