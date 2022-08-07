module.exports = {
    test: async(ctx,next) => {
        try{
            // ctx.body = JSON.stringify(ctx.request.body)
            let rbody = ctx.request.body;
            let req_body = JSON.parse(rbody);
            let startTime = req_body.start_time;
            let groupId = req_body.group_id;
            let meet = await strapi.services['zoom-service'].createMeeting(groupId,startTime);
            console.log(meet.data)
            //TODO identify the zoom role based on user type 
            let role = 1; // clinician
            let signature = await strapi.services['zoom-service'].generateSignature(meet.id,role);
            let obj = {
                meetingNumber:meet.id,
                signature:signature,
                password:meet.password,
                userName:'userNameX'
            }
            ctx.body = JSON.stringify(obj)
        }catch(err){
            console.log(err)
            ctx.body = JSON.stringify(err)
        }
    }
}