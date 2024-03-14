const User = require("../models/User");
const authController = {};
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");

const bcrypt = require("bcryptjs");

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }, "+password");
  if (!user) throw new AppError(400, "Invalid Credentials", "Login Error");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "wrong password", "Login Error");

  const accessToken = await user.generateToken();
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create User Successfully"
  );
});
module.exports = authController;
