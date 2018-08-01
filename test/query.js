'use strict';

require('should');

const clientLib = require('../lib/client.js');

const client = clientLib.create()
const QUERY =
  'from demo.ecommerce.data select eventdate,protocol,statusCode,method'
const startDate = new Date(Date.now() - 60 * 1000)


describe('Query client', () => {

  it('queries remote server', done => {
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
    }
    client.query(options, (error, result) => {
      return done(error, result)
    })
  });

  it('queries with overriden env variable', done => {
    const oldUrl = process.env.DEVO_URL
    process.env.DEVO_URL = 'https://test.test/test'
    const overridden = clientLib.create()
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
    }
    overridden.query(options, (error, result) => {
      process.env.DEVO_URL = oldUrl
      if (!error) return done(new Error('Should not access with env variable'))
      return done()
    })
  })

  it('streams a query', done => {
    let totalRows = 0
    let totalHeaders = 0
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
    }
    const stream = client.stream(options)
    stream.on('data', () => totalRows++)
    stream.on('meta', () => totalHeaders++)
    stream.on('end', () => {
      totalRows.should.be.a.Number()
      totalHeaders.should.equal(1)
      //console.log('read %s rows', totalRows)
      done();
    });
    stream.on('error', done)
  });

  it('streams without finish date', done => {
    let totalRows = 0
    const options = {
      dateFrom: startDate,
      dateTo: -1,
      query: QUERY,
      format: 'json/compact',
    }
    const stream = client.stream(options)
    stream.on('meta', () => {
      //console.log('meta')
      setTimeout(() => {
        totalRows.should.be.greaterThan(0)
        stream.end()
      }, 1000)
    })
    stream.on('data', () => {
      totalRows += 1
    })
    stream.on('end', done)
    stream.on('error', done)
  });
});

