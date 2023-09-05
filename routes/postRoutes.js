const express = require('express');
const router = express.Router();
const postController = require("../controller/postController");

router.get("/", postController.getPostByUserId);
router.put("/:postid", postController.deletePostById);

module.exports = router;