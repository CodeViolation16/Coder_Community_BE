const Post = require("../models/Post");
const { AppError, sendResponse, catchAsync } = require("../helpers/utils");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");

const postControllers = {};

const calculatePostCount = async (userId) => {
  const postCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });

  await User.findByIdAndUpdate(userId, { postCount });
};

postControllers.createNewPost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { content, image } = req.body;

  let post = await Post.create({ content, image, author: currentUserId });
  post = await post.populate("author");

  calculatePostCount(currentUserId);

  return sendResponse(
    res,
    200,
    true,
    post,
    false,
    "Create new Post successfully"
  );
});

postControllers.updateSinglePost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;

  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, "Post not found", "Update Post error");
  if (!post.author.equals(currentUserId))
    throw new AppError(400, "Only author can edit Post", "Update Post error");

  const allows = ["content", "image"];

  allows.forEach((field) => {
    if (req.body[field] !== "undefined") {
      post[field] = req.body[field];
    }
  });

  await post.save();

  return sendResponse(res, 200, true, post, false, "Update Post successfully");
});

postControllers.getSinglePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;

  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, " Post not found", "Get  Post error");

  post = post.toJSON();
  post.comments = await Comment.find({ post: post._id }).populate("author");

  return sendResponse(res, 200, true, post, false, "Get Post successfully");
});

postControllers.getPosts = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.userId;

  let user = await User.findById(userId);
  if (!user) throw new AppError(400, "User not found", "Get Post error");

  let { limit, page, a } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  console.log(req.query, a);
  let userFriendIDs = await Friend.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  if (userFriendIDs && userFriendIDs.length) {
    userFriendIDs = userFriendIDs.map((friend) => {
      if (friend.from._id.equals(userId)) return friend.to;
      return friend.from;
    });
  } else {
    userFriendIDs = [];
  }

  userFriendIDs = [...userFriendIDs, userId];

  const filterConditions = [
    { isDeleted: false },
    { author: { $in: userFriendIDs } },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Post.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let posts = await Post.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(res, 200, true, { posts, totalPages, count }, false, "");
});

postControllers.deleteSinglePost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;

  const post = await Post.findOneAndUpdate(
    { _id: postId, author: currentUserId },
    { isDeleted: true },
    { new: true }
  );
  if (!post)
    throw new AppError(
      400,
      "Post not found or User cannot delete Post",
      "Delete Post error"
    );

  calculatePostCount(currentUserId);

  return sendResponse(res, 200, true, post, false, "Update Post successfully");
});

postControllers.getCommentsOfPost = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const postId = req.params.id;
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;

  // Validate post exist
  let post = await Post.findById(postId);
  if (!post)
    throw new AppError(400, "Post not found", "Get comment of post error");

  // Processing
  const count = await Comment.countDocuments({ post: postId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);
  const comments = await Comment.find({ post: postId })
    .populate("author")
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { comments, count, totalPages },
    false,
    "Get comments successfully"
  );
});
module.exports = postControllers;
