'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const mongoose = require('mongoose');
module.exports = {
    find: async(ctx,next) => {
        let response = {};
        try{
            let clinician_id = ctx.userdata.clinician._id;
            console.log(clinician_id)
            let data = await strapi.query('clinician-patient-groups').find({clinician:mongoose.Types.ObjectId(ctx.userdata.clinician._id)})
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
    findOne: async(ctx,next) => {
        let response = {};
        try{
            let data = await strapi.query('clinician-patient-groups').findOne({clinician:mongoose.Types.ObjectId(ctx.userdata.clinician._id),_id:mongoose.Types.ObjectId(ctx.params.id)})
            await strapi.query('clinicians').update({_id:mongoose.Types.ObjectId(ctx.userdata.clinician._id)},{lastGroupAccessed:ctx.params.id});
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
    create: async(ctx,next) => {
        let response = {};
        try{
            let data = await strapi.query('clinician-patient-groups').create({...ctx.request.body,clinician:mongoose.Types.ObjectId(ctx.userdata.clinician._id)})
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
    update: async(ctx,next) => {
        let response = {};
        try{
            let data = await strapi.query('clinician-patient-groups').update({_id:mongoose.Types.ObjectId(ctx.params.id),clinician:mongoose.Types.ObjectId(ctx.userdata.clinician._id)},{...ctx.request.body})
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
