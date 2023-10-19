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

const getAllCliques = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  // knex("clique")
  //   .join("user", "clique.user_id", "=", "user.id")
  //   .join("favourites", "clique.id","")
  //   .select(
  //     "clique.id",
  //     "clique.name",
  //     "clique.category",
  //     "clique.description",
  //     "user.display_name",
  //     "user.username"
  //   )
  //   .where("clique.status", "Active")
  //   .orderBy("clique.updated_at", "desc")
  //   .then((data) => {
  //     return res.status(200).json({ clique: data, clientid: clientId });
  //   })
  //   .catch((err) => {
  //     return res
  //       .status(500)
  //       .json({ message: `Unable to retrieve cliques: ${err}` });
  //   });

  knex('clique')
    .select('clique.*', "user.display_name","user.avatar_url","favourites.status", knex.raw('CASE WHEN favourites.clique_id IS NOT NULL THEN true ELSE false END AS is_favourite'))
    .join("user", "clique.user_id", "=", "user.id")
    .leftJoin('favourites', function() {
      this.on('clique.id', '=', 'favourites.clique_id')
          .andOn('favourites.user_id', '=', knex.raw('?', [clientId]))
          // .andOn('favourites.status', '=', knex.raw('?', ['Added']));
    })
    .then(data => {
      return res.status(200).json({ clique: data, clientid: clientId });
    })
    .catch(error => {
      console.error('Error:', error);
      return res
        .status(500)
        .json({ message: `Unable to retrieve cliques: ${error}` });
    });
};

const getCliquesById = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("clique")
    .join("user", "clique.user_id", "=", "user.id")
    .select(
      "clique.id",
      "clique.name",
      "clique.category",
      "clique.description",
      "clique.banner_url",
      "user.avatar_url",
      "user.display_name",
      "user.username"
    )
    .where("clique.id", req.params.cliqueid)
    .andWhere("clique.status", "Active")
    .first()
    .then((data) => {
      if (!data) {
        return res.status(404).json({
          message: `Clique with the id: ${req.params.cliqueid} was not found`,
        });
      }
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({
        message: `Unable to carryout this request, please retry: ${err}`,
      });
    });
};

const createClique = async (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  const { name, description, category, banner_url } = req.body;

  if (!name || !description || !category) {
    return res.status(400).json({ message: "Form is incomplete" });
  }

  try {
    // Use a single transaction to ensure data integrity
    const createdClique = await knex.transaction(async (trx) => {
      const [newCliqueId] = await trx("clique").insert({
        name,
        description,
        category,
        banner_url,
        user_id: clientId,
        banner_url: "/images/cliqueBanner.png",
      });

      const [newUserCliqueConnection] = await trx("user_clique").insert({
        user_id: clientId,
        clique_id: newCliqueId,
        user_roles: "Owner",
      });

      // Fetch the created clique
      const [createdClique] = await trx("clique").where("id", newCliqueId);
      return createdClique;
    });

    // Send the created clique as a response
    res.status(200).json({ newClique: createdClique, creatorid: clientId });
  } catch (error) {
    console.error("Could not create Clique: ", error);
    res.status(500).json({ error: "Could not create Clique" });
  }
};

const searchClique = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  const searchString = req.body.search;
  knex("clique")
    .select("clique.*", "user.username")
    .join("user", "clique.user_id", "=", "user.id")
    .whereRaw("LOWER(category) LIKE ?", `%${searchString.toLowerCase()}%`)
    .orWhereRaw("LOWER(name) LIKE ?", `%${searchString.toLowerCase()}%`)
    .orWhereRaw("LOWER(description) LIKE ?", `%${searchString.toLowerCase()}%`)
    .orWhereRaw("LOWER(user.username) LIKE ?", `%${searchString}%`)
    .orWhereRaw("LOWER(user.display_name) LIKE ?", `%${searchString}%`)
    .andWhere({ status: "Active" })
    .then((data) => {
      if (data.length) {
        return res.status(200).json({ cliqueData: data, clientid: clientId });
      } else {
        return res.status(404).json({ message: "Unable able to find Clique" });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: `Unable to carry out request, please try again later: ${error}`,
      });
    });
};

const editCliqueById = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("clique")
    .where({ id: req.body.id })
    .andWhere({ user_id: clientId })
    .update(req.body)
    .then((updatedClique) => {
      res
        .status(204)
        .json({ updatedData: updatedClique[0], clientid: clientId });
    })
    .catch(() => {
      res.status(500).json({
        message: `Unable to make changes to Clique with ID: ${req.body.id}`,
      });
    });
};

const changeCliqueStatus = (newStatus, responseCode, req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("clique")
    .where({ id: req.body.id })
    .andWhere({ user_id: clientId })
    .whereNot({ status: "Deleted" })
    .update({ status: `${newStatus}` })
    .then((updatedClique) => {
      res
        .status(responseCode)
        .json({ updatedData: updatedClique[0], clientid: clientId });
    })
    .catch(() => {
      res.status(500).json({
        message: `Unable to make changes to Clique with ID: ${req.body.id}`,
      });
    });
};

const deactivateCliqueById = (req, res) => {
  changeCliqueStatus("Deactivated", 204, req, res);
};

const deleteCliqueById = (req, res) => {
  changeCliqueStatus("Deleted", 204, req, res);
};

const reactivateClique = (req, res) => {
  changeCliqueStatus("Active", 200, req, res);
};

const fetchPostsOfCliques = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!clientId) {
    clientId = req.user.id;
  }

  knex("clique")
    .join("post", "post.clique_id", "clique.id")
    .where({ clique_id: req.params.cliqueId })
    .then((posts) => {
      if (posts.length === 0) {
        return res.status(404).json({
          message: `Posts for user with ID: ${req.params.userId} not found`,
        });
      }

      res.status(200).json({ posts: posts, clientid: clientId });
    })
    .catch((error) => {
      res.status(500).json({
        message: `Unable to retrieve posts for user with ID: ${req.params.id} ${error}`,
      });
    });
};

const getPostByCliqueId = (req, res) => {
  let clientId = validateJwt(req.headers.authorization);

  if (!clientId && !req.user) {
    return res.status(401).send("Request unauthorized");
  }

  const cliqueid = req.params.cliqueid;

  knex("post")
    .select(
      "post.id",
      "post.user_id",
      "post.clique_id",
      "post.content",
      "post.created_by",
      "post.image_url",
      "user.display_name",
      "user.avatar_url"
    )
    .join("clique", "post.clique_id", "=", "clique.id")
    .join("user", "post.user_id", "=", "user.id")
    .where("post.status", "Active")
    .andWhere("post.clique_id", cliqueid)
    .orderBy("post.created_by", "desc")
    .then((post) => {
      return res.status(200).json({ post: post, clientId: clientId });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err.message);
    });
};

module.exports = {
  createClique,
  editCliqueById,
  deleteCliqueById,
  deactivateCliqueById,
  reactivateClique,
  getAllCliques,
  getCliquesById,
  fetchPostsOfCliques,
  searchClique,
  getPostByCliqueId,
};
