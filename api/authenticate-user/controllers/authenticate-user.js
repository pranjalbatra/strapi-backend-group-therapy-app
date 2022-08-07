'use strict';

/**
 * A set of functions called "actions" for `test`
 */
const axios = require('axios');
module.exports = {
  authUser: async (ctx, next) => {
    let response = {};
    try {
      response.data = ctx.userdata;
      response.message = 'Success';
      response.statusCode = 200;
    } catch (err) {
      console.log('error',err);
      response.error = err;
      response.message = 'Error';
      response.statusCode = 400;
    }
    ctx.body = response
  }
};