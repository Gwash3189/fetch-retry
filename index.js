'use strict';
require('isomorphic-fetch');

module.exports = function(url, options) {
  var retries = 3;
  var retryDelay = 1000;
  var retryOn = [];
  var expoential = false
  var attempts = 1

  if (options && options.retries) {
    retries = options.retries;
  }

  if (options && options.expoential) {
    expoential = options.expoential
  }

  if (options && options.retryDelay) {
    retryDelay = options.retryDelay;
  }

  if (options && options.retryOn) {
    if (options.retryOn instanceof Array) {
      retryOn = options.retryOn;
    } else {
      throw {
        name: 'ArgumentError',
        message: 'retryOn property expects an array'
      }
    }
  }

  return new Promise(function(resolve, reject) {
    var wrappedFetch = function(n, attempts) {
      fetch(url, options)
        .then(function(response) {
          if (retryOn.indexOf(response.status) === -1) {
            resolve(response);
          } else {
            if (n > 0) {
              retry(n, attempts);
            } else {
              resolve(response);
            }
          }
        })
        .catch(function(error) {
          if (n > 0) {
            retry(n, attempts);
          } else {
            reject(error);
          }
        });
    };

    function retry(n, attempts) {
      setTimeout(function() {
          wrappedFetch(--n, ++attempts);
        }, retryDelay * attempts);
    }

    wrappedFetch(retries, attempts);
  });
};
