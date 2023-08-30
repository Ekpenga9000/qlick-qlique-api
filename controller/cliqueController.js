const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");

const validateJwtAndPassport = (token = null, googleAuth = null, res) => {
  if (!token && !googleAuth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let user_id;

  if (token) {
    const authToken = token.split(" ")[1];
    jwt.verify(authToken, process.env.SESSION_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send("Invalid auth token");
      }
      user_id = decode.id;
    });
  } else {
    user_id = googleAuth.id;
  }

  return user_id;
};

const getAllCliques = (req, res) => {
  knex("clique")
    .where({ status: "Active" })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: `Unable to retrieve cliques: ${err}` });
    });
};

const getCliquesById = (req, res) => {
  knex("clique")
    .where({ id: req.params.cliqueId })
    .andWhere({ status: "Active" })
    .then((data) => {
      if (!data.length) {
        return res.status(404).json({
          message: `Clique with the id: ${req.params.cliqueId} was not found`,
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
  const user_id = validateJwtAndPassport(
    req.headers.authorization,
    req.user,
    res
  );

  const { name, description, category, banner_url } = req.body;

  if (!name || !description || !category) {
    return res.status(400).json({ message: "Form is incomplete" });
  }

  try {
    // Use a single transaction to ensure data integrity
    const createdClique = await knex.transaction(async (trx) => {
      // Insert new clique and get inserted ID
      const [newCliqueId] = await trx("clique").insert({
        name,
        description,
        category,
        banner_url,
        user_id,
      });

      // Insert a new user_clique connection
      const [newUserCliqueConnection] = await trx("user_clique").insert({
        user_id,
        clique_id: newCliqueId,
        user_roles: "Owner",
      });

      // Fetch the created clique
      const [createdClique] = await trx("clique").where("id", newCliqueId);
      return createdClique;
    });

    // Send the created clique as a response
    res.json({ newClique: createdClique });
  } catch (error) {
    console.error("Could not create Clique: ", error);
    res.status(500).json({ error: "Could not create Clique" });
  }
};

const searchClique = (req, res) => {
  const searchString = req.body.search;
  knex("clique")
    .select("clique.*", "user.username")
    .join("user", "clique.user_id", "=", "user.id")
    .whereRaw("LOWER(category) LIKE ?", `%${searchString.toLowerCase()}%`)
    .orWhereRaw("LOWER(name) LIKE ?", `%${searchString.toLowerCase()}%`)
    .orWhereRaw("LOWER(description) LIKE ?", `%${searchString.toLowerCase()}%`)
    .orWhereRaw("LOWER(user.username) LIKE ?", `%${searchString}%`)
    .andWhere({ status: "Active" })
    .then((data) => {
      if (data.length) {
        return res.status(200).json(data);
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
  const user_id = validateJwtAndPassport(
    req.headers.authorization,
    req.user,
    res
  );

  knex("clique")
    .where({ id: req.body.id })
    .andWhere({ user_id: user_id })
    .update(req.body)
    .then((updatedClique) => {
      res.status(204).json(updatedClique[0]);
    })
    .catch(() => {
      res.status(500).json({
        message: `Unable to make changes to Clique with ID: ${req.body.id}`,
      });
    });
};

const changeCliqueStatus = (newStatus, req, res) => {
  const user_id = validateJwtAndPassport(
    req.headers.authorization,
    req.user,
    res
  );

  knex("clique")
    .where({ id: req.body.id })
    .andWhere({ user_id: user_id })
    .whereNot({ status: "Deleted" })
    .update({ status: `${newStatus}` })
    .then((updatedClique) => {
      res.status(204).json(updatedClique[0]);
    })
    .catch(() => {
      res.status(500).json({
        message: `Unable to make changes to Clique with ID: ${req.body.id}`,
      });
    });
};

const deactivateCliqueById = (req, res) => {
  changeCliqueStatus("Deactivated", req, res);
};

const deleteCliqueById = (req, res) => {
  changeCliqueStatus("Deleted", req, res);
};

const reactivateClique = (req, res) => {
  changeCliqueStatus("Active", req, res);
};

const fetchPostsOfCliques = (req, res) => {
  knex("clique")
    .join("post", "post.clique_id", "clique.id")
    .where({ clique_id: req.params.cliqueId })
    .then((posts) => {
      if (posts.length === 0) {
        return res
          .status(404)
          .json({
            message: `Posts for user with ID: ${req.params.userId} not found`,
          });
      }

      res.status(200).json(posts);
    })
    .catch((error) => {
      res.status(500).json({
        message: `Unable to retrieve posts for user with ID: ${req.params.id} ${error}`,
      });
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
};
