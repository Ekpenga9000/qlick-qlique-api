const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const path = require("path");

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


const getPostByUserId = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Request unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("post")
    .select(
      "post.id",
      "post.user_id",
      "post.clique_id",
      "post.content",
      "post.created_by",
      "post.image_url",
      "user.display_name",
        "user.avatar_url", 
        "clique.name"
    )
    .join("clique", "post.clique_id", "=", "clique.id")
    .join("user", "post.user_id", "=", "user.id")
    .where("post.status", "Active")
    .andWhere("post.user_id", clientId)
    .orderBy("post.created_by", "desc")
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
  getPostByUserId,
  deletePostById,
};
