const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");

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

const addToFavourites = (req, res) => {
  if (!req.headers.authorization && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  let clientId = validateJwt(req.headers.authorization);

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("favourites")
    .where("user_id", req.body.user_id)
    .andWhere("clique_id", req.body.clique_id)
    .andWhere("status", "Removed")
    .update("favourites.status", "Added")
    .then((data) => {
      if (data) {
        return res.status(200).send("Record updated!");
      } else {
        knex("favourites")
          .insert({
            user_id: req.body.user_id,
            clique_id: req.body.clique_id,
          })
          .then(() => {
            knex("favourites")
              .join("user", "favourites.user_id", "=", "user.id")
              .join("clique", "favourites.clique_id", "=", "clique.id")
              .select(
                "favourites.id as favourites_id",
                "clique.id",
                "clique.name",
                "user.display_name",
                "user.username"
              )
              .where("favourites.status", "Added")
              .andWhere("clique.status", "Active")
              .andWhere("favourites.user_id", req.body.user_id)
              .then((data) => {
                return res.status(200).json(data);
              })
              .catch((err) => {
                console.log(err);
                return res.status(500).send("Unable to fetch data:", err);
              });
          })
          .catch((err) => {
            return res.status(500).send("Unable to add to favourites", err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Unable to add to favourites", err);
    });
};

const removeFromFavourites = (req, res) => {
  if (!req.headers.authorization && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  knex("favourites")
    .where("user_id", req.body.user_id)
    .andWhere("clique_id", req.body.clique_id)
    .update("favourites.status", "Removed")
    .then(() => {
      knex("favourites")
        .join("user", "favourites.user_id", "=", "user.id")
        .join("clique", "favourites.clique_id", "=", "clique.id")
        .select(
          "favourites.id as favourites_id",
          "clique.id",
          "clique.name",
          "user.display_name",
          "user.username"
        )
        .where("favourites.status", "Added")
        .andWhere("clique.status", "Active")
        .andWhere("favourites.user_id", req.body.user_id)
        .then((data) => {
          return res.status(200).json(data);
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send("Unable to fetch data:", err);
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err);
    });
};

const unfollowClique = (req, res) => {
  if (!req.headers.authorization && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  knex("favourites")
    .where("user_id", req.body.user_id)
    .andWhere("clique_id", req.body.clique_id)
    .update("favourites.status", "Removed")
    .then(() => {
      //   knex("favourites")
      //     .join("user", "favourites.user_id", "=", "user.id")
      //     .join("clique", "favourites.clique_id", "=", "clique.id")
      //     .select(
      //       "favourites.id as favourites_id",
      //       "clique.id",
      //       "clique.name",
      //       "user.display_name",
      //       "user.username"
      //     )
      //     // .where("favourites.status", "Added")
      //     .where("clique.status", "Active")
      //     .andWhere("favourites.user_id", req.body.user_id)
      //     .then((data) => {
      //       return res.status(200).json(data);
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //       return res.status(500).send("Unable to fetch data:", err);
      //     });

      knex("clique")
        .select(
          "clique.*",
          "user.display_name",
          "favourites.status",
          knex.raw(
            "CASE WHEN favourites.clique_id IS NOT NULL THEN true ELSE false END AS is_favourite"
          )
        )
        .join("user", "clique.user_id", "=", "user.id")
        .leftJoin("favourites", function () {
          this.on("clique.id", "=", "favourites.clique_id").andOn(
            "favourites.user_id",
            "=",
            knex.raw("?", [req.body.user_id])
          );
          // .andOn('favourites.status', '=', knex.raw('?', ['Added']));
        })
        .then((data) => {
          return res
            .status(200)
            .json({ clique: data, clientid: req.body.user_id });
        })
        .catch((error) => {
          console.error("Error:", error);
          return res
            .status(500)
            .json({ message: `Unable to retrieve cliques: ${error}` });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err);
    });
};

const fetchFavouritesByUserId = (req, res) => {
  if (!req.headers.authorization && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  let clientId = validateJwt(req.headers.authorization) || req.user?.id;

  if (!clientId) {
    return res.status(401).send("Unauthorized");
  }

  knex("favourites")
    .join("user", "favourites.user_id", "=", "user.id")
    .join("clique", "favourites.clique_id", "=", "clique.id")
    .select(
      "favourites.id as favourites_id",
      "clique.id",
      "clique.name",
      "user.display_name",
      "user.username"
    )
    .where("favourites.status", "Added")
    .andWhere("clique.status", "Active")
    .andWhere("favourites.user_id", parseInt(req.params.userid)) // Filter by a specific user's user_id
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Unable to fetch data:", err);
    });
};

module.exports = {
  addToFavourites,
  removeFromFavourites,
  unfollowClique,
  fetchFavouritesByUserId,
};
