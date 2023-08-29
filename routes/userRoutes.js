const express = require("express");
const router = express.Router(); 
const userController = require("../controller/userController");

router.get("/:userId", userController.fetchUserById);



module.exports = router;