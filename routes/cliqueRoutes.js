const express = require("express");
const router = express.Router();
const cliqueController = require("../controller/cliqueController")


router.get("/",cliqueController.getAllCliques);

router.post("/", cliqueController.createClique);

router.get("/search", cliqueController.searchClique);

router.get("/:cliqueid", cliqueController.getCliquesById)

module.exports = router;