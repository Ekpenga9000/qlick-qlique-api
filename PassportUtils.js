const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  function(_accessToken, _refreshToken, profile, done) {
    
    knex('user')
      .select('id')
      .where({ google_id: profile.id })
      .andWhere({email:profile._json.email})
      .then(user => {
          if (user.length) {
              const payload = { id: user[0].id };
              const token = jwt.sign(payload, process.env.SESSION_SECRET, {
                  expiresIn:"1h"
              })
          done(null,{id:user[0].id, token});
        } else {
          knex('user')
            .insert({
              google_id: profile.id,
              avatar_url: profile._json.picture,
              username: profile.displayName,
                email: profile._json.email,
                firstname: profile._json.given_name,
                lastname:profile._json.family_name
            })
              .then(userId => {
                const payload = { id: user[0].id };
              const token = jwt.sign(payload, process.env.SESSION_SECRET, {
                  expiresIn:"1h"
              })
              done(null,{id:userId[0], token});
        
            })
            .catch(err => {
              console.log('Error creating a user', err);
            });
        }
      })
      .catch(err => {
        console.log('Error fetching a user', err);
      });
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((userId, done) => {
    knex('user')
      .where({ id: userId })
      .then(user => {
        done(null, user[0]);
      })
      .catch(err => {
        console.log('Error finding user', err);
      });
  });
  