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
                        clique_id:req.body.clique_id, 
                    })
                    .then(() => {
                        return res.status(201).send("Clique has been added to favourites")
                    })
                    .catch((err) => {
                        return res.status(500).send("Unable to add to favourites", err);
                    })
            }
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).send("Unable to add to favourites", err);
        });

}

const removeFromFavourites = (req, res) => {

    if (!req.headers.authorization && !req.user) {
        return res.status(401).send("Unauthorized");
    }

      knex("favourites")
        .where("user_id", req.body.user_id)
        .andWhere("clique_id", req.body.clique_id)
        .update("favourites.status", "Removed")
        .then(() => {
        return res.status(201).send("Clique has been removed from favorites")
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).send(err);

    })
} 

const fetchFavouritesByUserId = (req, res) => {

    if (!req.headers.authorization && !req.user) {
        return res.status(401).send("Unauthorized")
    }
    
    let clientId = validateJwt(req.headers.authorization);

    if (!clientId) {
        console.log("The req.user", req.user);
        clientId = req.user.id;
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
  

}



module.exports = {
    addToFavourites,
    removeFromFavourites, 
    fetchFavouritesByUserId
}