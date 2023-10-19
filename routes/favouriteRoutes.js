const express = require("express");
const favouritesRouter = express.Router();
const favouritesController = require("../controller/favouriteController"); 

favouritesRouter.get("/:userid", favouritesController.fetchFavouritesByUserId);
favouritesRouter.post("/", favouritesController.addToFavourites);
favouritesRouter.post("/remove", favouritesController.removeFromFavourites);
favouritesRouter.post("/unfollow", favouritesController.unfollowClique);

module.exports = favouritesRouter;