const express = require("express");
const app = express();
const expressSession = require("express-session");
const cors = require("cors");
const knex = require("knex")(require("./knexfile"));
const helmet = require("helmet");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();
const port = process.env.PORT;
const userRouter = require("./routes/userRoutes");
const cliqueRouter = require("./routes/cliqueRoutes");
const postRouter = require("./routes/postRoutes");
const authRouter = require("./routes/authRoutes");
const favouritesRouter = require("./routes/favouriteRoutes");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");

app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);


// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     optionsSuccessStatus: 204
//   })
// );

const corsOptions = {
  origin: process.env.CLIENT_URL, // your frontend server
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE', // include DELETE
  withCredentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (_accessToken, _refreshToken, profile, done) {
      knex("user")
        .select("id")
        .where({ google_id: profile.id })
        .andWhere({ email: profile._json.email })
        .first()
        .then((user) => {
          if (user) {
            done(null, user);
          } else {
            const hashedPassword = bcrypt.hashSync(profile._json.email, 10);
            const newBio = `🌟 Living my best life and making each moment count on Clique. Let's make memories and spread positivity! 💕`;

            const downloadAndSaveImage = async (url, userId) => {
              try {
                const response = await axios({
                  method: "GET",
                  url,
                  responseType: "stream",
                });

                const writer = fs.createWriteStream(
                  `./assets/images/${userId}.png`
                );
                response.data.pipe(writer);

                writer.on("finish", () => {
                  console.log("Image downloaded and saved.");
                });
              } catch (error) {
                console.error("Error downloading image:", error);
              }
            };

            downloadAndSaveImage(profile._json.picture, profile.id);

            knex("user")
              .insert({
                google_id: profile.id,
                avatar_url: `/images/${profile.id}.png`,
                username: profile._json.email,
                email: profile._json.email,
                firstname: profile._json.given_name,
                lastname: profile._json.family_name,
                password_hash: hashedPassword,
                bio: newBio,
                display_name: profile.displayName,
              })
              .then((userId) => {
                done(null, { id: userId[0] });
              })
              .catch((err) => {
                console.log("Error creating a user", err);
              });
          }
        })
        .catch((err) => {
          console.log("Error fetching a user", err);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  knex("user")
    .where({ id: userId })
    .then((user) => {
      done(null, user[0]);
    })
    .catch((err) => {
      console.log("Error finding user", err);
    });
});

app.use(express.static("./assets"));

app.use("/auth", authRouter);
app.use("/profiles", userRouter);
app.use("/posts", postRouter);
app.use("/cliques", cliqueRouter);
app.use("/favourites", favouritesRouter);

app.get("/", (req, res) => {
  res.json({ "msg": "hello" }).status(200);
})

const validateJwt = (token) => {
  if (!token) {
    return null;
  }
  let user_id;
  const authToken = token.split(" ")[1];
  jwt.verify(authToken, process.env.SESSION_SECRET, (err, decode) => {
    if (err) {
      return null;
    }
    user_id = decode.id;
  });
  return user_id;
};

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/images/posts");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      "Error: File upload only supports the following file types - " + filetypes
    );
  },
});

app.post("/posts", upload.single("postImg"), (req, res) => {
  if (!req.headers.authorization && !req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  const clientId = validateJwt(req.headers.authorization) || req.user.id;

  if (!req.body.content && !req.file && !req.body.cliqueid) {
    console.log(
      "The body when all required fields are not filled",
      req.body.content,
      req.file,
      req.body
    );
    return res.status(400).send("Your request is missing one or more fields");
  }

  const img_url = req.file ? `images/posts/${req.file.filename}` : null;

  knex("post")
    .insert({
      content: req.body.content,
      user_id: clientId,
      clique_id: req.body.cliqueid,
      image_url: img_url,
    })
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port, () => {
  console.log(`Server cooking 🔥🔥🔥 on ${port}!!!`);
});
