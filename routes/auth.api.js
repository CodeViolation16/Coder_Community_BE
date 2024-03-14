const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();
const { body } = require("express-validator");
const validators = require("../middlewares/validators");

router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

module.exports = router;
