'use strict';

/**
 * `auth0-service` service.
 */
require('dotenv').config();
const axios = require('axios');
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
var MGMT_API_TOKEN = false;
module.exports = {
  // exampleService: (arg1, arg2) => {
  //   return isUserOnline(arg1, arg2);
  // }
 
  validateUserToken:async (access_token) =>{
    const data = await axios({
      method: 'get',
      url: `https://${AUTH0_DOMAIN}/userinfo`,
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    return data.data
  },
  setManagementToken:async ()=>{
    var options = {
      method: 'POST',
      url: `https://${AUTH0_DOMAIN}/oauth/token`,
      //headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: {
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${AUTH0_DOMAIN}/api/v2/`
      }
    };
    
    await axios.request(options).then(function (response) {
      //console.log(response.data);
      MGMT_API_TOKEN = response.data.access_token;
    }).catch(function (error) {
      console.error(error);
    });
  },
  createUser: async(role,userData) =>{
    console.log('userData',userData)
    await module.exports.setManagementToken();
    var headers = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': 'MANAGEMENT_API_USER',
      'Authorization': `Bearer ${MGMT_API_TOKEN}`
    };
    
    let password = "mEm0-p@sS-"+Math.round(Math.random()*100000);
    var data = {"email":userData.email,
    "user_metadata":{},"blocked":false,
    "email_verified":false,
    "app_metadata":{"role":role,"userinfo":false},"nickname":userData.username,
    "picture":"https://secure.gravatar.com/avatar/15626c5e0c749cb912f9d1ad48dba440?s=480&r=pg&d=https%3A%2F%2Fssl.gstatic.com%2Fs2%2Fprofiles%2Fimages%2Fsilhouette80.png",
    "user_id":"","connection":"Username-Password-Authentication",
    "password":password,
    "verify_email":false};
  
    var options = {
      url: `https://${AUTH0_DOMAIN}/api/v2/users`,
      method: 'POST',
      headers: headers,
      data: data
    };
    await axios.request(options).then(function (response) {
      let subject = `MEMO Rehab | Clinician | Invitation `;

      let msg = `Hello! You have been added as a clinician to MEMO.\n
      Visit https://memorehab.com.au and login as a clinician\n
      You can login with these credentials.\n 
      Email: ${userData.email}\n
      Password:${password}\n
      We advise that you change your password.\nThank you and have a nice day :)\nTEAM MEMO`;

      strapi.services['sendgrid-service'].sendEmail(userData.email,subject,msg);
      
      console.log(response.data);
    }).catch(function (error) {
      console.error(error);
      throw `Auth0 User Creation Failed`
    });

  },
  updateUserAppMeta: async(auth0UserId,metadata) =>{
    await module.exports.setManagementToken();
    var headers = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': 'MANAGEMENT_API_USER',
      'Authorization': `Bearer ${MGMT_API_TOKEN}`
    };
    var data = {"app_metadata":metadata}
    var options = {
      url: `https://${AUTH0_DOMAIN}/api/v2/users/${auth0UserId}`,
      method: 'PATCH',
      headers: headers,
      data: data
    };
    await axios.request(options).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.error(error);
      throw `User Update Failed`
    });

  }

};
