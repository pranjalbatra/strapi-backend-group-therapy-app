'use strict';

/**
 * `sendgrid-service` service.
 */
require('dotenv').config();
const axios = require('axios');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
module.exports = {
  
  sendEmail:async (to,subject,msg) =>{
    let headers = {"Authorization": "Bearer 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"}
    
    const data = await axios({
      method: 'POST',
      url: `https://api.sendgrid.com/v3/mail/send`,
      headers: headers,
      data:{"personalizations": [{"to": [{"email": to}]}],"from": {"email": "pranjal.batra@memorehab.com.au"},
      "subject": subject,"content": [{"type": "text/plain", "value": msg}]}
    });
    return data.data
  }
};
