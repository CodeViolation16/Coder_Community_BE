const express = require("express");
const { loginRequired } = require("../middlewares/authentication");
const { body, param } = require("express-validator");
const { validate, checkObjectId } = require("../middlewares/validators");
const {
  sendFriendRequest,
  getReceivedFriendRequestList,
  getSentFriendRequestList,
  getFriendList,
  reactFriendRequest,
  cancelFriendRequest,
  removeFriend,
} = require("../controllers/friend.controller");

const router = express.Router();

/**
 * @route POST /friends/requests
 * @description Send a friend request
 * @body {to : "User ID"}
 * @access Login required
 **/
router.post(
  "/requests",
  loginRequired,
  validate([body("to").exists().isString().custom(checkObjectId)]),
  sendFriendRequest
);

/**
 * @route GET /friends/requests/incoming
 * @description Get list of receive pending request
 * @access Login required
 **/
router.get("/requests/incoming", loginRequired, getReceivedFriendRequestList);

/**
 * @route GET /friends/requests/outgoing
 * @description Get list of send pending request
 * @access Login required
 **/
router.get("/requests/outgoing", loginRequired, getSentFriendRequestList);

/**
 * @route GET /friends
 * @description Get list of friends
 * @access Login required
 **/
router.get("/", loginRequired, getFriendList);

/**
 * @route PUT /friends/requests/:userId
 * @description Accept/Reject a receive pending request
 * @body {status: "accepted" or "declined"}
 * @access Login required
 **/
router.put(
  "/requests/:userId",
  loginRequired,
  validate([
    body("status", "Invalid Status")
      .exists()
      .notEmpty()
      .isIn(["accepted", "declined"]),
    param("userId").exists().isString().custom(checkObjectId),
  ]),
  reactFriendRequest
);

/**
 * @route DELETE /friends/requests/:userId
 * @description Cancel a friend request
 * @access Login required
 **/
router.delete(
  "/requests/:userId",
  loginRequired,
  validate([param("userId").exists().isString().custom(checkObjectId)]),
  cancelFriendRequest
);

/**
 * @route DELETE /friends/:userId
 * @description Remove a friend
 * @access Login required
 **/
router.delete(
  "/:userId",
  loginRequired,
  validate([param("userId").exists().isString().custom(checkObjectId)]),
  removeFriend
);

module.exports = router;
