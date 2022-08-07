'use strict';

/**
 * A set of functions called "actions" for `test`
 */
const axios = require('axios');
module.exports = {
  exampleAction: async (ctx, next) => {
    try {
      //console.log(ctx);
      //console.log(ctx.request.body);
      //console.log(ctx.request.headers['Authorization']);

      let access_token = JSON.parse(ctx.request.body).access_token;
      console.log(ctx.request.body);
      // const response = await fetch(`https://dev-9ndb2-mo.au.auth0.com/api/v2/users/auth0|61c8c48272a3e400691a85ee`, {
      //   headers: {
      //       Authorization: `Bearer ${access_token}`
      //   }
      // })
      console.log(access_token);
      const data = await axios({
        method: 'get',
        url: 'https://dev-9ndb2-mo.au.auth0.com/userinfo',
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      console.log(data);
      console.log('tdat',typeof data);
      let d= data.data;
      console.log(typeof d,d);
      
      let userObj = {
        username:d.nickname,
        email:d.email,
        user_type:'patient',
        
      };
      const user = await strapi.query('user', 'users-permissions').create(userObj);
      let patObj = {
        users_permissions_user:user
      }
      const pat = await strapi.query('patients').create(patObj);
      

      ctx.body = JSON.stringify(d);
    } catch (err) {
      ctx.body = err;
    }
  }
};
