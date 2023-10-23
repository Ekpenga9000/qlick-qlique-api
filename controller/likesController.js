const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");

const validateJwt = (token) => {
  let user = null;
  const authToken = token.split(" ")[1];
  jwt.verify(authToken, process.env.SESSION_SECRET, (err, decode) => {
    if (err) return user;
    user = decode.id;
  });
  return user;
};

const addLike = async (req, res) => {
  if (!req.headers.authorization && !req.user)
    return res.status(401).send("Unauthorized");

  try {
    const clientId = validateJwt(req.headers.authorization) || req.user.id;

    //We can use this function to toggle the like in the application.

    //Adding like process
    //Check if the comment have been unliked before
    //there is data to confirm that the comment have been unliked, then change then change
    //status to like.
    //check if the comment is already liked then change the status to unlike.
    //there is no data of the kind, then insert a new liked

    const likeStatus = await knex("likes")
      .where("post_id", req.body.post_id)
      .andWhere("user_id", clientId)
      .andWhere("status", "Unliked")
      .update("likes.status", "Liked");

    if (likeStatus) {
      return res.status(200).send("Post liked");
    } else {
      const insertLikes = await knex("likes").insert({
        user_id: clientId,
        post_id: req.body.post_id,
      });
    }

    const data = await knex("likes")
      .join("user", "likes.user_id", "=", "user.id")
      .join("post", "likes.post_id", "=", "post.id")
      .select("user.id as user_id", "post.id as post_id", "likes.id as like_id")
      .where("likes.status", "Liked")
      .andWhere("post.status", "Active")
      .andWhere("user.status", "Active")
      .andWhere("post.id", req.body.post_id);

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "unable to carryout your request." });
  }
  //client validation.
};

const removeLike = (req, res) => {};

module.exports = {
  addLike,
  removeLike,
};
