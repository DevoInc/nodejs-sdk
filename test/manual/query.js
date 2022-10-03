'use strict';

require('should');

const clientLib = require('../../lib/client.js');
const config = require('../../lib/config.js');

const client = clientLib.create();
const QUERY =
  'from siem.logtrust.web.activity select *';
const startDate = new Date(Date.now() - 60 * 60 * 1000);


describe('Query client', () => {

  it('queries remote server', done => {
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
    };
    client.query(options, (error, result) => {
      if (error) return done(error);
      if (!result.timestamp) return done(new Error('Result without timestamp'));
      done();
    });
  });

  it('queries with overriden env variable', done => {
    const oldUrl = process.env.DEVO_URL;
    process.env.DEVO_URL = 'https://test.test/test';
    const overridden = clientLib.create();
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
    };
    overridden.query(options, (error, _result) => {
      clearEnvUrl(oldUrl);
      if (!error) return done(new Error('Should not access with env variable'));
      return done();
    });
  });

  it('queries with url ending in /', done => {
    const oldUrl = process.env.DEVO_URL;
    const read = config.read();
    process.env.DEVO_URL = read._url + '/';
    const overridden = clientLib.create();
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
    };
    overridden.query(options, (error, result) => {
      clearEnvUrl(oldUrl);
      return done(error, result);
    });
  });

  it('queries for CSV', done => {
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'csv',
    };
    client.query(options, (error, result) => {
      if (typeof result != 'string') {
        return done(new Error('CSV result should be string'));
      }
      return done(error, result);
    });
  });

  it('queries for full JSON', done => {
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json',
    };
    client.query(options, (error, result) => {
      if (!result.timestamp) return done(new Error('Result without timestamp'));
      return done(error, result);
    });
  });

  it('queries with skip and limit', done => {
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
      skip: 10,
      limit: 10,
    };
    client.query(options, (error, result) => {
      if (error) return done(error);
      if (!result.timestamp) return done(new Error('Result without timestamp'));
      const rows = result.object.d;
      rows.length.should.be.below(11);
      return done();
    });
  });

  it('streams a query', done => {
    let totalRows = 0;
    let totalHeaders = 0;
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: QUERY,
      format: 'json/compact',
    };
    const stream = client.stream(options);
    stream.on('data', () => totalRows++);
    stream.on('meta', () => totalHeaders++);
    stream.on('end', () => {
      totalRows.should.be.a.Number();
      totalHeaders.should.equal(1);
      done();
    });
    stream.on('error', done);
  });

  it('streams without finish date', done => {
    let totalRows = 0;
    const options = {
      dateFrom: startDate,
      query: QUERY,
      format: 'json/compact',
    };
    const stream = client.stream(options);
    stream.on('meta', () => {
      setTimeout(() => {
        totalRows.should.be.greaterThan(0);
        stream.end();
      }, 5000);
    });
    stream.on('data', () => {
      totalRows += 1;
    });
    stream.on('end', done);
    stream.on('error', done);
  });

  it('streams with invalid query', done => {
    const options = {
      dateFrom: startDate,
      dateTo: new Date(),
      query: 'from asd123123 sel123123s aasdas123',
      format: 'json/compact',
    };
    const stream = client.stream(options);
    stream.on('error', (_error) => done());
    stream.on('done', () => done('Should throw error'));
  });

  it('streams with invalid table', done => {
    const options = {
      dateFrom: startDate,
      dateTo: -1,
      query: QUERY.replace('activity', 'actibity'),
      format: 'json/compact',
    };
    const stream = client.stream(options);
    stream.on('meta', () => done('Should not send meta'));
    stream.on('data', () => done('Should not send data'));
    stream.on('end', () => done('Should not finish'));
    stream.on('error', () => done());
  });
});

function clearEnvUrl(oldUrl) {
  if (oldUrl) {
    process.env.DEVO_URL = oldUrl;
  } else {
    delete process.env.DEVO_URL;
  }
}

