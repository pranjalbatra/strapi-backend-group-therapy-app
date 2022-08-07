'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const mongoose = require('mongoose');
module.exports = {
    inviteParticipant: async (ctx, next) => {
        let response = {};
        try{
            //console.log(ctx.request);
            let rbody = ctx.request.body;
            let req_body = JSON.parse(rbody);
            console.log('body ',req_body)
           // console.log('json',JSON.parse(req_body))
            let email_ids = req_body.email_ids;
            let errorList = [];
            let clinician_group_id = req_body.clinician_group_id;
            let group = await strapi.query('clinician-patient-groups').findOne({_id:mongoose.Types.ObjectId(clinician_group_id)});
            if(!group){
                throw `Invalid clinician group id`
            }
            let members = [];
            try {
                members = JSON.parse(group.members);
            } catch (error) {
                members = [];
            } 
            
            for(let email_id of email_ids){
                let found = members.find(x => x.email === email_id)
                if(found){
                    if(found.invitationStatus == "pending"){
                        errorList.push({email:email_id,success:false,msg:`Invitation pending`})
                    }
                }
                if(ctx.userdata.clinician._id.toString() != group.clinician._id.toString()){
                    throw `unauthorized clinician`
                }
                let user = await strapi.query('user', 'users-permissions').findOne({email:email_id});
                if(user){
                    if(user.user_type != 'participant'){
                        errorList.push({email:email_id,error:`User not a participant`})
                    }else{
                        let participant = await strapi.query('participants').findOne({users_permissions_user:user})
                        if(!participant)
                            errorList.push({email:email_id,success:false,msg:`invalid participant`})
                        // check if user already in some active group
                        let userInGroup = await strapi.query('clinician-patient-groups').findOne({participants:participant,current_status:'active'});
                        if(userInGroup){
                            if(userInGroup._id.toString() == clinician_group_id)
                                errorList.push({email:email_id,success:false,msg:`User is already a member of this group`})
                            errorList.push({email:email_id,success:false,msg:`This user is already a member of another active group`})
                        }
                    }
                }
                let hasError = errorList.find(x => x.email === email_id)
                if(!hasError){
                    let subject = `MEMO Rehab | Participant | Invitation `;
                    //TODO change message if user exists
                    let msg = `
                    You have been invited to join MEMO by ${ctx.userdata.clinician.title} ${ctx.userdata.clinician.fullname} to join their group.\n
                    Sign in to the MEMO app : https://app.memorehab.net
                    `;
                    await strapi.services['sendgrid-service'].sendEmail(email_id,subject,msg);
                    members.push({email:email_id,invitationStatus:'pending'});
                }
            }
            await strapi.query('clinician-patient-groups').update({_id:mongoose.Types.ObjectId(clinician_group_id)},{members:JSON.stringify(members)})
            response.data = {
                errorList:errorList
            };
            response.message = 'Success';
            response.statusCode = 200;
        }catch (err) {
            console.log('error',err);
            response.error = err;
            response.message = 'Error';
            response.statusCode = 400;
        }
        ctx.body = response;
    },
    update: async(ctx,next) => {
        let response = {};
        try{
            let data = await strapi.query('clinicians').update({_id:mongoose.Types.ObjectId(ctx.userdata.clinician._id)},{...ctx.request.body})
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
