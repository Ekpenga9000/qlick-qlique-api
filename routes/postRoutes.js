const express = require('express');
const router = express.Router();
const postController = require("../controller/postController");
const multer = require('multer');
const upload = multer(); 

router.post("/", upload.single('postImg'),postController.createPost);
router.get("/", postController.getPostByCliqueAndUserId);
router.put("/:postid", postController.deletePostById);

module.exports = router;