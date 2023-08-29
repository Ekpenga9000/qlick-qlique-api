const knex = require("knex")(require('../knexfile'));

const createPost = (req, res) => {
    if (!req.headers.authorization) {
       return res.status(401).json({message:"No token included."})
    } 
    
    //check for the jwt token - check
    //check that there is a user 
    //check that there is a clique id
    // check that the inputs are not empty
}

module.exports = {
    createPost
}