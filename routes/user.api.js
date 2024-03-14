const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body, param } = require("express-validator");
const { validate, checkObjectId } = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

router.post(
  "/",

  validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userController.register
);

router.get("/", authentication.loginRequired, userController.getUsers);
router.get("/me", authentication.loginRequired, userController.getCurrentUser);

router.get(
  "/:id",
  authentication.loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),
  userController.getSingleUser
);

router.put(
  "/:id",
  authentication.loginRequired,
  validate([param("id").exists().isString().custom(checkObjectId)]),
  userController.updateProfile
);

module.exports = router;
