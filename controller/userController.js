const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");


const validateJwt = (token) => {
  if (!token) {
    return null;
  }
  const authToken = token.split(" ")[1];
  jwt.verify(authToken, process.env.SESSION_SECRET, (err, decode) => {
    if (err) {
      return null;
    }
  });
  return true;
};


const fetchUserById = (req, res) => {
  const token = validateJwt(req.headers.authorization);

  if (!token && !req.user) {
    return res.status(401).json({ message: "No or invalid token." });
  }

  knex(`user`)
    .where({ id: req.params.userId })
    .first()
    .then((user) => {
      delete user.password;
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({
        message: `We encountered an error carrying out your request: ${err}`,
      });
    });
};

const editUser = (req, res) => {
  const token = validateJwt(req.headers.authorization);

  if (!token && !req.user) {
    return res.status(401).json({ message: "No or invalid token." });
  }

  knex("user")
    .where({ id: req.params.userId })
    .andWhere("status", "Active")
    .update(req.body)
    .then(() => {
      return knex("user").where({
        id: req.params.userId,
      });
    })
    .then((updatedUser) => {
      res.status(204).json(updatedUser[0]);
    })
    .catch(() => {
      res.status(500).json({
        message: `Unable to make changes to user with ID: ${req.params.userId}`,
      });
    });
};

const deactivateUser = (req, res) => {
  const token = validateJwt(req.headers.authorization);

  if (!token && !req.user) {
    return res.status(401).json({ message: "No or invalid token." });
  }

  knex("user")
    .where({ id: req.params.userid })
    .andWhere("status", "Active")
    .update({ status: "Inactive" })
    .then(() => {
      return res.sendStatus(203);
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: `Unable to carryout operation: ${err.message}` });
    });
};

const softDeleteUserById = (req, res) => {
  const token = validateJwt(req.headers.authorization);

  if (!token && !req.user) {
    return res.status(401).json({ message: "No or invalid token." });
  }

  knex("user")
    .where({ id: req.params.userid })
    .andWhere("status", "Active")
    .update({ status: "Deleted" })
    .then(() => {
      return res.sendStatus(203);
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: `Unable to carryout operation: ${err.message}` });
    });
};

const reactivateUser = (req, res) => {
  const token = validateJwt(req.headers.authorization);

  if (!token && !req.user) {
    return res.status(401).json({ message: "No or invalid token." });
  }

  knex("user")
    .where({ id: req.params.userid })
    .andWhere("status", "Inactive")
    .then((user) => {
      if (!user.length) {
        return res
          .status(404)
          .json({ message: `Unable to find User with Id: ${req.params.id}` });
      }
    });
};

module.exports = {
  fetchUserById,
  editUser,
  softDeleteUserById,
  deactivateUser,
  reactivateUser,
};
