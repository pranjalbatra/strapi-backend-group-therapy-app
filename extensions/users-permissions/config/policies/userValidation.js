'use strict';

/**
 * `userValidation` policy.
 */
const axios = require('axios');
const mongoose = require('mongoose');

module.exports = async (ctx, next) => {
  // Add your own logic here.
  //console.log('In isAuthenticated policy.');
  //console.log('from isauth policy',ctx.request.body)
  try{
    var access_token = ctx.request.header.accesstoken
    //console.log(access_token)
    if(typeof access_token ==  `undefined`)
      throw `access token not found`
    var data = await strapi.services['auth0-service'].validateUserToken(access_token);
    console.log(data);
    let user_data_json = JSON.stringify(data);
    // check if user exists and role
    let user = await strapi.query('user', 'users-permissions').findOne({email:data.email});
    if(user){
      data.uid = user._id;
      data.firstlogin = false;
      data.user_type = user.user_type;
    }else{
      // create user in db with default role participant
      let userObj = {
        username:data.nickname+Date.now(),
        email:data.email,
        user_type:'participant',
      };
      const newUser = await strapi.query('user', 'users-permissions').create(userObj);
      data.uid = newUser._id;
      data.user_type = newUser.user_type;
      data.firstlogin = true;
      let participantObj = {
        users_permissions_user:newUser,
        fullname:data.nickname
      }
      await strapi.query('participants').create(participantObj);
    }
    
    switch(data.user_type){
      case 'participant':
        data.participant = await strapi.query('participants').findOne({users_permissions_user:mongoose.Types.ObjectId(data.uid)});
        break;
      case 'clinician':
        data.clinician = await strapi.query('clinicians').findOne({users_permissions_user:mongoose.Types.ObjectId(data.uid)});
        break;
      default:throw `Invalid user type`
    }
    //console.log('tdat',typeof data);
    // update user app metadata with role
    if(data['https://app.memorehab.net/metadata'].userinfo === false){
      let userinfo = {...data};
      delete userinfo['https://app.memorehab.net/metadata'];
      await strapi.services['auth0-service'].updateUserAppMeta(data.sub,{"role":data.user_type,"userinfo":userinfo});
    }
    await strapi.query('user', 'users-permissions').update({_id:mongoose.Types.ObjectId(data.uid)},{user_data_json:user_data_json});
    ctx.userdata = data;

    console.log('user validated');
    await next();
  }catch(err){
    console.log(err)
    ctx.unauthorized(err);
  }
};
