const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const User = require("../models/User");
const userController = {};
const bcrypt = require("bcryptjs");

userController.register = catchAsync(async (req, res, next) => {
  let { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "User Already Exist", "Registeration Error");
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });
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

userController.getUsers = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  let { limit, page, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{ isDeleted: false }];
  if (filter.name) {
    filterConditions.push({ name: { $regex: filter.name, $option: "i" } });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let users = await User.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  const promise = users.map(async (user) => {
    let temp = user.toJSON();
    temp.friendship = await Friend.findOne({
      $or: [
        { from: currentUserId, to: user._id },
        { from: user._id, to: currentUserId },
      ],
    });
    return temp;
  });

  const usersWithFriendShip = await Promise.all(promise);

  return sendResponse(
    res,
    200,
    true,
    { users, usersWithFriendShip, totalPages, count },
    false,
    ""
  );
});
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const currentUser = req.userId;

  const user = await User.findById(currentUser);
  if (!user)
    throw new AppError(400, "Current user not found", "Get current User error");

  return sendResponse(
    res,
    200,
    true,
    user,
    false,
    "Get current user successfully"
  );
});

userController.getSingleUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.id;

  let user = await User.findById(userId);
  if (!user)
    throw new AppError(400, "Single user not found", "Get single User error");

  user = user.toJSON();
  user.friendship = await Friend.findOne({
    $or: [
      { from: currentUserId, to: user._id },
      { from: user._id, to: currentUserId },
    ],
  });
  return sendResponse(
    res,
    200,
    true,
    user,
    false,
    "Get single user successfully"
  );
});
module.exports = userController;
