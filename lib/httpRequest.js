'use strict';

const request = require('basic-request');


/**
 * Class to make API requests using the http library (Node.js only).
 */
class HttpRequest {

  constructor() {
  }

  /**
   * Make a POST api call using the Node.js basic-request library.
   *
   * @param {Object} options Contains all options, including:
   *  - url: endpoint to use.
   *  - headers: an object with headers.
   *  - body: to send with the request.
   * @param {function(*)} callback Function to call with (error, result).
   */
  post(options, callback) {
    const params = {
      headers: options.headers,
    };
    request.post(options.url, options.body, params, (error, message) => {
      if (error) return callback(error);
      return callback(null, message);
    });
  }

  /**
   * Make a GET api call using the Node.js basic-request library.
   *
   * @param {Object} options Contains all options, including:
   *  - url: endpoint to use.
   *  - headers: an object with headers.
   * @param {function(*)} callback Function to call with (error, result).
   */
  get(options, callback) {
    const params = {
      headers: options.headers,
    };
    request.get(options.url, params, (error, message) => {
      if (error) return callback(error);
      return callback(null, message);
    });
  }

  /**
   * Get the response for an API call using the Node.js basic-request library.
   *
   * @param {Object} options Contains all options, including:
   *  - url: endpoint to use.
   *  - method: HTTP GET, POST...
   *  - headers: an object with headers.
   *  - body: to send with the request.
   * @param {function(*)} callback Function to call with (error, response).
   */
  getResponse(options, callback) {
    const params = {
      headers: options.headers,
    };
    request.getResponse(options.url, options.method, options.body, params,
      callback);
  }
}

exports.create = options => new HttpRequest(options);

