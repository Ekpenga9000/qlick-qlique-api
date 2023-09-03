const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/images/posts/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
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
}).single("postImage"); // "postImage" is the form field name

const createPost = async (req, res) => {
  if (!req.headers.authorization && !req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  const clientId = req.headers.authorization
    ? validateJwt(req.headers.authorization)
    : req.user.id;

    if (!req.body.content && req.body.file || !req.body.cliqueid) {
        console.log("The body", req.body.content, req.body.file, req.body);
    return res.status(400).send("Your request is missing one or more fields");
  }

  // Upload and Validate File
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    // File uploaded successfully
    const img_url = req.file ? `images/posts/${req.file.filename}` : null;

    try {
      const [newPost] = await knex("post")
        .insert({
          content: req.body.content,
          user_id: clientId,
          clique_id: req.body.cliqueid,
          url: img_url,
        })
        .returning("id");

      res.status(200).json({
        message: "Post successfully saved.",
        post_id: newPost,
      });
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .json({ message: "Could not save to DB", error: error.message });
    }
  });
};

const getPostByCliqueAndUserId = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Request unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("post")
    .join("clique", "post.clique_id", "=", "clique.id")
    .join("user", "post.user_id", "=", "user.id")
    .where("post.status", "Active")
    .then((post) => {
      return res.status(200).json({ post: post, clientId: clientId });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err.message);
    });
};

const deletePostById = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Request unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("post")
    .where("id", req.params.postid)
    .andWhere("user_id", clientId)
    .andWhere("status", "Active")
    .update("status", "Deleted")
    .then(() => {
      return res.status(204).send("Post have been deleted");
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err.message);
    });
};

module.exports = {
  createPost,
  getPostByCliqueAndUserId,
  deletePostById,
};

