const express = require('express');
const app = express(); 
const expressSession = require("express-session");
const cors = require('cors');
const knex = require('knex')(require('./knexfile'));
const helmet = require('helmet');
require("dotenv").config();
const port = process.env.PORT;
const userRouter = require('./routes/userRoutes'); 
const cliqueRouter = require("./routes/cliqueRoutes");
const postRouter = require("./routes/postRoutes");
const authRouter = require("./routes/authRoutes");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: true,
    credentials:true
}));

app.use(
    expressSession({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
    function (_accessToken, _refreshToken, profile, done) {
      
    knex('user')
      .select('id')
      .where({ google_id: profile.id })
        .andWhere({ email: profile._json.email })
        .first()
      .then(user => {
          if (user) {
          done(null,user);
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
              done(null,{id:userId[0]});
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
      .where({ id: userId})
      .then(user => {
        done(null, user[0]);
      })
      .catch(err => {
        console.log('Error finding user', err);
      });
  });
  


app.use("/auth", authRouter);
app.use("/users", userRouter);
// app.use("/post", postRouter);
// app.use("/clique", cliqueRouter);




app.listen(port, () => {
    console.log(`Server cooking 🔥🔥🔥 on ${port}!!!`);
})
