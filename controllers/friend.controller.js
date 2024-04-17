const Friend = require("../models/Friend");
const User = require("../models/User");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const friendControllers = {};

const calculateFriendCount = async (userId) => {
  const friendCount = await Friend.countDocuments({
    $or: [{ from: userId, to: userId }],
  });

  await User.findByIdAndUpdate(userId, { friendCount: friendCount });
};

friendControllers.sendFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const toUserId = req.body.to;

  let user = await User.findById(toUserId);
  if (!user)
    throw new AppError(400, "User Not Found", "Send Friend Request error");

  let friend = await Friend.findOne({
    $or: [
      { from: toUserId, to: currentUserId },
      { from: currentUserId, to: toUserId },
    ],
  });

  if (!friend) {
    // Create new friend
    friend = await Friend.create({
      from: currentUserId,
      to: toUserId,
      status: "pending",
    });

    return sendResponse(res, 200, true, friend, false, "Request has been sent");
  } else {
    switch (friend.status) {
      // status === pending -> error already request
      case "pending":
        if (friend.from.equals(currentUserId)) {
          throw new AppError(
            400,
            "You have already send request to this user",
            "Add Friend Error"
          );
        } else {
          throw new AppError(
            400,
            "You have already received request to this user",
            "Add Friend Error"
          );
        }
      // status === accepted -> error already friend
      case "accepted":
        throw new AppError(400, "Users are already friend", "Add Friend Error");
      // status === declined -> update to pending
      case "declined":
        friend.from = currentUserId;
        friend.to = toUserId;
        friend.status = "pending";
        await friend.save();
        return sendResponse(
          res,
          200,
          true,
          friend,
          false,
          "Request has been sent"
        );
      default:
        throw new AppError(400, "Friend status undefined", "Add Friend Error");
    }
  }
});

friendControllers.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    const currentUserId = req.userId;
    let { limit, page, ...filter } = { ...req.query };

    let requestList = await Friend.find({
      to: currentUserId,
      status: "pending",
    });

    const requestListIDs = await requestList.map((friend) => {
      if (friend.from.equals(currentUserId)) return friend.to;
      return friend.from;
    });

    const filterConditions = [{ _id: { $in: requestListIDs } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const count = await User.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const userWithFriendShip = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });

    return sendResponse(
      res,
      200,
      true,
      { users, userWithFriendShip, totalPages, count },
      false,
      ""
    );
  }
);

friendControllers.getSentFriendRequestList = catchAsync(
  async (req, res, next) => {
    const currentUserId = req.userId;
    let { limit, page, ...filter } = { ...req.query };

    let requestList = await Friend.find({
      from: currentUserId,
      status: "pending",
    });

    const requestListIDs = await requestList.map((friend) => {
      if (friend.from.equals(currentUserId)) return friend.to;
      return friend.from;
    });

    const filterConditions = [{ _id: { $in: requestListIDs } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const count = await User.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const userWithFriendShip = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });

    return sendResponse(
      res,
      200,
      true,
      { users, userWithFriendShip, totalPages, count },
      false,
      ""
    );
  }
);

friendControllers.getFriendList = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  let { limit, page, ...filter } = { ...req.query };

  let friendList = await Friend.find({
    $or: [{ from: currentUserId }, { to: currentUserId }],
    status: "accepted",
  });

  const friendIDs = await friendList.map((friend) => {
    if (friend.from.equals(currentUserId)) return friend.to;
    return friend.from;
  });

  const filterConditions = [{ _id: { $in: friendIDs } }];
  if (filter.name) {
    filterConditions.push({
      ["name"]: { $regex: filter.name, $options: "i" },
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const users = await User.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  const userWithFriendShip = users.map((user) => {
    let temp = user.toJSON();
    temp.friendship = friendList.find((friendship) => {
      if (friendship.from.equals(user._id) || friendship.to.equals(user._id)) {
        return { status: friendship.status };
      }
      return false;
    });
    return temp;
  });

  return sendResponse(
    res,
    200,
    true,
    { users, userWithFriendShip, totalPages, count },
    false,
    ""
  );
});

friendControllers.reactFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId; // To
  const fromUserId = req.params.userId; // From
  const { status } = req.body;

  let friend = await Friend.findOne({
    from: fromUserId,
    to: currentUserId,
    status: "pending",
  });
  if (!friend)
    throw new AppError(400, "Friend not found", "React friend request error");

  friend.status = status;
  await friend.save();

  if (friend.status === "accepted") {
    await calculateFriendCount(currentUserId);
    await calculateFriendCount(fromUserId);
  }

  return sendResponse(
    res,
    200,
    true,
    friend,
    false,
    "React friend request successfully"
  );
});

friendControllers.cancelFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const toUserId = req.params.userId;

  const friend = await Friend.findOne({
    from: currentUserId,
    to: toUserId,
    status: "pending",
  });
  if (!friend)
    throw new AppError(400, "Friend not found", "Cancel friend request error");

  await friend.delete();

  return sendResponse(
    res,
    200,
    true,
    friend,
    false,
    "Friend request has been canceled"
  );
});

friendControllers.removeFriend = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const friendId = req.params.userId;

  let friend = await Friend.findOne({
    $or: [
      { from: friendId, to: currentUserId },
      { from: currentUserId, to: friendId },
    ],
    status: "accepted",
  });

  if (!friend)
    throw new AppError(400, "Friend not found", "Remove friend error");

  await friend.delete();
  await calculateFriendCount(currentUserId);
  await calculateFriendCount(friendId);

  return sendResponse(res, 200, true, friend, false, "Friend has been removed");
});

module.exports = friendControllers;
