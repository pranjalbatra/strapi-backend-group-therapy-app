'use strict';

/**
 * `zoom-service` service.
 */
 const KJUR = require('jsrsasign')
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();
const axios = require('axios');
const zoomApiUrl = 'https://api.zoom.us/v2/';
const ZOOM_SDK_KEY = 'icvddfPLSBKSlMxuks_DRA';
const ZOOM_SDK_SECRET = 'SrSpoQDUc9CYAmfLdfuJfjuhdUoK9P1G8kWW';
const ZOOM_JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImljdmRkZlBMU0JLU2xNeHVrc19EUkEiLCJleHAiOjE2NDc2MDIyNDUsImlhdCI6MTY0Njk5NzQ0NX0.b5hYrWTgty5JSas_YTGdBmqLaG9g9HSHmtAsk7FmLTU'; //TODO get from env
module.exports = {
  createMeeting:async (groupId,startTime) =>{
    console.log('hyaaa')
    try{
      let headers = {"Authorization": "Bearer "+ZOOM_JWT}
      // "mEm0-p@sS-"+Math.round(Math.random()*100000);
      let password = "pass123"
      
      const meetingData = await axios({
        method: 'POST',
        url: `${zoomApiUrl}users/me/meetings`,
        headers: headers,
        data:{
          "agenda": "string",
          "default_password": false,
          "duration": 12340,
          "password": password,
          "pre_schedule": false,
          "recurrence": {
            "end_date_time": "2022-08-24T14:15:22Z",
            "end_times": 1,
            "monthly_day": 1,
            "monthly_week": -1,
            "monthly_week_day": 1,
            "repeat_interval": 0,
            "type": 1,
            "weekly_days": "1"
          },
          //"2022-03-24T14:15:22Z"
          "start_time": startTime,
          "template_id": "string",
          //"timezone": "string",
          "topic": "string",
          "tracking_fields": [
            {
              "field": "string",
              "value": "string"
            }
          ],
          "type": 1
        }
      });
      
      let sessionObj = {
        clinician_patient_group:mongoose.Types.ObjectId(groupId),
        sessiondata_json:JSON.stringify(meetingData.data)
      }
      const sessionData = await strapi.query('live-sessions').create(sessionObj);
      return meetingData.data
    }catch(err){
      throw err
    }
  },
  generateSignature:async (meetingNumber,role) =>{
    // console.log(meetingNumber,role)
    // const timestamp = new Date().getTime() - 30000
    // const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64')
    // const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64')
    // const signature = Buffer.from("%s.%s.%s.%s.%s", apiKey, meetingNumber, timestamp, role, hash).toString('base64')
    

  const iat = Math.round(new Date().getTime() / 1000)
  const exp = iat + 60 * 60 * 2

  const oHeader = { alg: 'HS256', typ: 'JWT' }
const oPayload = {
    sdkKey: ZOOM_SDK_KEY,
    mn: meetingNumber,
    role: role,
    iat: iat,
    exp: exp,
    appKey: ZOOM_SDK_KEY,
    tokenExp: iat + 60 * 60 * 2
  }

  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, ZOOM_SDK_SECRET)
    
    return signature
  }
};
