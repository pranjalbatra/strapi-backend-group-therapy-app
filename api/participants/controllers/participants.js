'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const mongoose = require('mongoose');

module.exports = {
    update: async(ctx,next) => {
        let response = {};
        try{
            let data = await strapi.query('participants').update({_id:mongoose.Types.ObjectId(ctx.userdata.participant._id)},{...ctx.request.body})
            response.data = data;
            response.message = 'Success';
            response.statusCode = 200;
        }catch(err){
            console.log(err)
            response.error = err;
            response.message = 'Error';
            response.statusCode = 400;
        }
        ctx.body = response  
    },
    getGroupInvites: async(ctx,next) => {
        let response = {};
        try{
            let data = [];
            let email = ctx.userdata.email;
            let groups = await strapi.query('clinician-patient-groups').find({members:{$regex: new RegExp(email)}})
            console.log(groups,email)
            if(groups.length){
                groups.forEach(function(group){
                    let members = JSON.parse(group.members);
                    let found = members.find(x => x.email === email && x.invitationStatus == 'pending')
                    if(found){
                        data.push({...group})
                    }
                })
            }
            response.data = data;
            response.message = 'Success';
            response.statusCode = 200;
        }catch(err){
            console.log(err)
            response.error = err;
            response.message = 'Error';
            response.statusCode = 400;
        }
        ctx.body = response  
    },
    answerInvite: async(ctx,next) => {
        let response = {};
        try{
            let rbody = ctx.request.body;
            let req_body = JSON.parse(rbody);
            let answer = req_body.answer;
            let group_id = req_body.group_id;

            if(!['accepted','declined'].includes(answer)){
                throw `answer must be a string 'accepted' or 'declined'`
            }

            let data = [];
            let email = ctx.userdata.email;
            let group = await strapi.query('clinician-patient-groups').findOne({_id:mongoose.Types.ObjectId(group_id)})
            if(!group)
                throw `Invalid Group`
            let members = JSON.parse(group.members);
            let foundIndex = members.findIndex(x => x.email === email && x.invitationStatus == 'pending')
            if(foundIndex != -1){
                members[foundIndex].invitationStatus = answer;
                let updateObj = {members:JSON.stringify(members)};
                if(answer == 'accepted'){
                    group.participants.push(mongoose.Types.ObjectId(ctx.userdata.participant._id))
                    updateObj.participants = group.participants
                }
                await strapi.query('clinician-patient-groups').update({_id:mongoose.Types.ObjectId(group_id)},updateObj)
                if(answer == 'accepted'){
                    await strapi.query('participants').update({_id:mongoose.Types.ObjectId(ctx.userdata.participant._id)},{isInvitationAccepted:true})
                }
            }else{
                throw `Invalid Data`
            }
            response.data = data;
            response.message = 'Success';
            response.statusCode = 200;
        }catch(err){
            console.log(err)
            response.error = err;
            response.message = 'Error';
            response.statusCode = 400;
        }
        ctx.body = response  
    },
    getActiveGroup: async(ctx,next) => {
        let response = {};
        try{
            let data = await strapi.query('clinician-patient-groups').findOne({participants:mongoose.Types.ObjectId(ctx.userdata.participant._id)})
            response.data = data;
            response.message = 'Success';
            response.statusCode = 200;
        }catch(err){
            console.log(err)
            response.error = err;
            response.message = 'Error';
            response.statusCode = 400;
        }
        ctx.body = response 
    }
};
