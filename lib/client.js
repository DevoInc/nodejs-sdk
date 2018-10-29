'use strict';

const helper = require('@devo/js-helper');
const config = require('./config.js');
const httpRequest = require('./httpRequest.js');
const queryStream = require('./queryStream.js');

const STREAMING_FORMAT = 'json/simple/compact'


/**
 * Client for queries and tasks.
 */
class Client {

  /**
   * Create the client.
   * @param {Object} credentials User credentials.
   */
  constructor(credentials) {
    this._config = config.read(credentials);
  }

  /**
   * Send a query request to the API.
   *
   * @param {Object} options Configuration values.
   * @param {function(*)} callback Function to invoke with (error, result).
   */
  query(options, callback) {
    const opc = this._config.parseQuery(options)
    if (!helper.config.validate(opc)) {
      return callback('Invalid options')
    }
    httpRequest.create().post(opc, callback)
  }

  /**
   * Send a query request to the API, return a stream.
   *
   * @param {Object} options Configuration values.
   * @returns a ReadableStream that emits one event per row.
   */
  stream(options) {
    const opc = this._config.parseQuery(options, STREAMING_FORMAT);
    if (!helper.config.validate(opc)) {
      throw new Error('Invalid options')
    }
    const stream = queryStream.create(this._config, options);
    httpRequest.create().getResponse(opc, (error, response) => {
      if (error) {
        stream.emit('error', 'Invalid response: ' + error)
      }
      response.pipe(stream)
    })
    return stream
  }

  /**
   * Get the list of pending tasks.
   *
   * @param {function(*)=} callback Function to invoke with (error, info).
   */
  getTasks(callback) {
    const opc = this._config.parseGet(helper.taskPaths.getTasks())
    httpRequest.create().get(opc, callback);
  }

  /**
   * Get a list of tasks by type.
   *
   * @param {String} type Type of the desired tasks.
   * @param {function(*)=} callback Function to invoke with (error, info).
   */
  getTasksByType(type, callback) {
    const opc = this._config.parseGet(helper.taskPaths.getTasksByType(type))
    httpRequest.create().get(opc, callback);
  }

  /**
   * Get info for an existing task.
   *
   * @param {String} taskId ID of the task.
   * @param {function(*)=} callback Function to invoke with (error, info).
   */
  getTaskInfo(taskId, callback) {
    const opc = this._config.parseGet(helper.taskPaths.getTaskInfo(taskId))
    httpRequest.create().get(opc, callback);
  }

  /**
   * Start an existing task.
   *
   * @param {String} taskId ID of the task.
   * @param {function(*)=} callback Function to invoke with (error, info).
   */
  startTask(taskId, callback) {
    const opc = this._config.parseGet(helper.taskPaths.startTask(taskId))
    httpRequest.create().get(opc, callback);
  }

  /**
   * Stop an existing task.
   *
   * @param {String} taskId ID of the task.
   * @param {function(*)=} callback Function to invoke with (error, info).
   */
  stopTask(taskId, callback) {
    const opc = this._config.parseGet(helper.taskPaths.stopTask(taskId))
    httpRequest.create().get(opc, callback);
  }

  /**
   * Delete an existing task.
   *
   * @param {String} taskId ID of the task.
   * @param {function(*)=} callback Function to invoke with (error, info).
   */
  deleteTask(taskId, callback) {
    const opc = this._config.parseGet(helper.taskPaths.deleteTask(taskId))
    httpRequest.create().get(opc, callback);
  }
}

exports.create = credentials => new Client(credentials)

