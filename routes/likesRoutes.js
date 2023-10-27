const express = require("express");
const likesRouter = express.Router();
const likesController = require("../controller/likesController");

likesRouter.get("/:postid", likesController.getLikes);
likesRouter.post("/", likesController.addLike);
likesRouter.put("/unlike", likesController.removeLike);

module.exports = likesRouter;