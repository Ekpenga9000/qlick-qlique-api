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

const getLikes = async (req, res) => {
  if (!req.headers.authorization && !req.user)
    return res.status(401).send("Unauthorized");

  try {
    let clientId = validateJwt(req.headers.authorization);

    if (!clientId) {
      clientId = req.user.id;
    }
    // Make first call for all likes to the post

    let likesCount = 0; 
    let userLiked;

    const getCountQuery = await knex("likes")
      .count("likes.id as likes_count")
      .innerJoin("user", "likes.user_id", "user.id")
      .innerJoin("post", "likes.post_id", "post.id")
      .where("likes.status", "Liked")
      .andWhere("post.status", "Active")
      .andWhere("user.status", "Active")
      .andWhere("post.id", req.params.postid);

    likesCount = getCountQuery[0].likes_count

    // Make the second call for the likes made by the user.
    const userLikedQuery = await knex("likes")
      .count("id as user_like_count")
      .where("user_id", clientId)
      .andWhere("post_id", req.params.postid)
      .andWhere("status", "Liked");
    
    userLiked = userLikedQuery[0].user_like_count > 0;
     

    return res.status(200).json({ likesCount, userLiked });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Unable to process your request at this time.");
  }
};

const addLike = async (req, res) => {
  if (!req.headers.authorization && !req.user)
    return res.status(401).send("Unauthorized");

  try {
    let clientId = validateJwt(req.headers.authorization);

    if (!clientId) {
      clientId = req.user.id
    }

    const likeStatus = await knex("likes")
      .where("post_id", req.body.post_id)
      .andWhere("user_id", clientId)
      .andWhere("status", "Unliked")
      .update("likes.status", "Liked");

    if (!likeStatus) {
      await knex("likes").insert({
        user_id: clientId,
        post_id: req.body.post_id,
        user_id: clientId,
      });
    }

    const getCountQuery = await knex("likes")
      .count("likes.id as likes_count")
      .innerJoin("user", "likes.user_id", "user.id")
      .innerJoin("post", "likes.post_id", "post.id")
      .where("likes.status", "Liked")
      .andWhere("post.status", "Active")
      .andWhere("user.status", "Active")
      .andWhere("post.id", req.body.post_id);
    
    const likesCount = getCountQuery[0].likes_count;

    return res.status(200).json({ data: likesCount, isLiked: true });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "unable to carryout your request." });
  }
  //client validation.
};

const removeLike = async (req, res) => {
  if (!req.headers.authorization && !req.user)
    return res.status(401).send("Unauthorized");

  try {
    let clientId = validateJwt(req.headers.authorization);

    if (!clientId) {
      clientId = req.user.id
    }

    await knex("likes")
      .where("post_id", req.body.post_id)
      .andWhere("user_id", clientId)
      .andWhere("status", "Liked")
      .update("likes.status", "Unliked");

      const getCountQuery = await knex("likes")
      .count("likes.id as likes_count")
      .innerJoin("user", "likes.user_id", "user.id")
      .innerJoin("post", "likes.post_id", "post.id")
      .where("likes.status", "Liked")
      .andWhere("post.status", "Active")
      .andWhere("user.status", "Active")
      .andWhere("post.id", req.body.post_id);
    
    const likesCount = getCountQuery[0].likes_count;

    return res.status(200).json({ data: likesCount, isLiked: false });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "unable to carryout your request." });
  }
};

module.exports = {
  addLike,
  removeLike,
  getLikes
};
