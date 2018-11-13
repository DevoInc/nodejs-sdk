'use strict';

require('should');

const clientLib = require('../../lib/client.js');

const QUERY =
  'from demo.ecommerce.data select eventdate,protocol,statusCode,method'
const client = clientLib.create()
const options = {
  dateFrom: new Date(Date.now() - 60 * 1000),
  dateTo: new Date(),
  query: QUERY,
  format: 'json',
  destination: {
    type: 'donothing',
    params: {
      param0: '1',
    },
  },
}

describe('Tasks', () => {

  it('creates a new task and deletes it', done => {
    client.query(options, (error, result) => {
      if (error) return done(error);
      const taskId = result.object.id
      client.getTaskInfo(taskId, (error, info) => {
        if (error) return done(error);
        info.status.should.equal(0)
        client.deleteTask(taskId, (error, result) => {
          if (error) return done(error);
          result.status.should.equal(0)
          client.getTaskInfo(taskId, error => {
            if (error) return done();
            return done('Should not get info for deleted task')
          })
        })
      })
    })
  });

  it('starts and stops a new task', done => {
    client.query(options, (error, result) => {
      if (error) return done(error);
      result.status.should.equal(0)
      const taskId = result.object.id
      client.getTaskInfo(taskId, (error, info) => {
        if (error) return done(error);
        info.status.should.equal(0)
        client.stopTask(taskId, (error, info) => {
          if (error) return done(error);
          info.status.should.be.type('number')
          client.startTask(taskId, (error, info) => {
            if (error) return done(error);
            info.status.should.be.type('number')
            client.getTaskInfo(taskId, (error, info) => {
              if (error) return done(error);
              info.status.should.equal(0)
              done()
            })
          })
        })
      })
    })
  });

  it('gets the list of tasks', done => {
    client.getTasks((error, result) => {
      if (error) return done(error)
      result.object.length.should.not.equal(0)
      done()
    })
  });
});

