const express = require("express");
const { loginRequired } = require("../middlewares/authentication");
const { body, param } = require("express-validator");
const { validate, checkObjectId } = require("../middlewares/validators");
const { saveReaction } = require("../controllers/reaction.controller");

const router = express.Router();

// /**
//  * @route POST /reactions
//  * @description Save a reactions to post or comment
//  * @body {targetType: "Post" or "Comment", targetId, emoji: "Like" or "Dislike"}
//  * @access Login required
//  **/

router.post(
  "/",
  loginRequired,
  validate([
    body("targetType", "Invalid targetType")
      .exists()
      .notEmpty()
      .isIn(["Comment", "Post"]),
    body("targetId", "Invalid ObjectId")
      .exists()
      .notEmpty()
      .custom(checkObjectId),
    body("emoji", "Invalid Emoji")
      .exists()
      .notEmpty()
      .isIn(["like", "dislike"]),
  ]),
  saveReaction
);
module.exports = router;
