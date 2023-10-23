const express = require("express");
const likesRouter = express.Router();
const likesController = require("../controller/likesController");

likesRouter.post("/", likesController.addLike);

module.exports = likesRouter;