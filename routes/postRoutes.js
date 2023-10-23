const express = require('express');
const router = express.Router();
const postController = require("../controller/postController");

router.get("/", postController.getPostByUserId);
router.get("/:postid", postController.getPostByPostId)
router.put("/:postid", postController.deletePostById);

module.exports = router;