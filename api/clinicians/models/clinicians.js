'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
 module.exports = {
    /**
     * Triggered before clinician creation.
     */
    lifecycles: {
        async beforeCreate(data) {
            try{
                if(!data.users_permissions_user)
                    throw `No user selected`
                const clin = await strapi.query('clinicians').findOne({ users_permissions_user : data.users_permissions_user });
                if(clin){
                    throw `You have already added this user as a clinician`
                }
                const user = await strapi.query('user', 'users-permissions').findOne({_id:data.users_permissions_user});
                if(!user)
                    throw `No user selected`
                if(user.user_type == 'clinician')
                    await strapi.services['auth0-service'].createUser('clinician',user);
                else
                    throw `Invalid User Role`;
            }catch(err){
                console.log(err);
                throw strapi.errors.badRequest(err);
            }
        },
        async beforeUpdate(params,data){
            data.isProfileUpdated = true;
        }
    },
  };
