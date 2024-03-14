const express = require("express");
const router = express.Router();
const { loginRequired } = require("../middlewares/authentication");
const { body, param } = require("express-validator");
const { validate, checkObjectId } = require("../middlewares/validators");
const {
  createNewPost,
  updateSinglePost,
  getSinglePost,
  getPosts,
  deleteSinglePost,
  getCommentsOfPost,
} = require("../controllers/post.controllers");

/**
 * @route GET posts/user/:userId?page=1&limit=10
 * @description Get all posts an user with pagination
 * @access Login required
 **/
router.get(
  "/user/:userId",
  validate([param("userId").exists().isString().custom(checkObjectId)]),
  getPosts
);

/**
 * @route POST /posts
 * @description Create a new post
 * @body {content, image}
 * @access Login required
 **/
router.post(
  "/",
  loginRequired,
  validate([body("content", "Missing content").exists().notEmpty()]),
  createNewPost
);

/**
 * @route PUT /posts/:id
 * @description Update a post
 * @body {content, image}
 * @access Login required
 **/
router.put(
  "/:id",
  loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),
  updateSinglePost
);

/**
 * @route DELETE /posts/:id
 * @description Delete a post
 * @access Login required
 **/
router.delete(
  "/:id",
  loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),
  deleteSinglePost
);

/**
 * @route GET /posts/:id
 * @description Get a single post
 * @access Login required
 **/
router.get(
  "/:id",
  loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),
  getSinglePost
);

/**
 * @route GET /posts/:id/comments
 * @description Get comments
 * @access Login required
 **/
router.get(
  "/:id/comments",
  loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),
  getCommentsOfPost
);
module.exports = router;
