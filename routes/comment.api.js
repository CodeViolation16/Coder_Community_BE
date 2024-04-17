const express = require("express");
const authentication = require("../middlewares/authentication");
const router = express.Router();
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const commentController = require("../controllers/comment.controller");
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("content", "Missing").exists().notEmpty(),
    body("podtId", "Missing postID")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
    commentController.createNewComment,
  ])
);

router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(), 
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.updateSingleComment
);

router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([param("id").exists().isString().custom(validators.checkObjectId)]),
  commentController.deleteSingleComment
);

module.exports = router;
