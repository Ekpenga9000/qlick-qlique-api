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

app.use("/auth", authRouter);
app.use("/users", userRouter);
// app.use("/post", postRouter);
// app.use("/clique", cliqueRouter);




app.listen(port, () => {
    console.log(`Server cooking 🔥🔥🔥 on ${port}!!!`);
})
