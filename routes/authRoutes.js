const express = require('express');
const router = express.Router();
const authController = require("../controller/authController");


router.post("/login", authController.login);

// Todo, customer registers and once it is successful, customer is redirected to the login page.
// Once customer login is successful, customer it taken to profile page.

module.exports = router;