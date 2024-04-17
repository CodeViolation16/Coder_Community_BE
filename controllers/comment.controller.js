const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const commentControllers = {};

const calculateCommentCount = async (postId) => {
  const commentCount = await Comment.countDocuments({
    post: postId,
    isDeleted: false,
  });

  await Post.findByIdAndUpdate(postId, { commentCount });
};

commentControllers.createNewComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { content, postId } = req.body;
  // Check post is exist
  const post = await Post.findById(postId);
  if (!post)
    throw new AppError(400, "Post not found", "Create new comment error");

  // Create new comment
  let comment = await Comment.create({
    content,
    author: currentUserId,
    post: postId,
  });

  //   Update commentCount of post
  await calculateCommentCount(postId);
  comment = await comment.populate("author");

  //   Response to client
  return sendResponse(
    res,
    200,
    true,
    { comment },
    false,
    "Create new comment successfully"
  );
});

commentControllers.updateSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;
  const { content } = req.body;

  let comment = await Comment.findById(commentId);
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not Authorized",
      "Update single Comment error"
    );

  comment = await Comment.findByIdAndUpdate(
    { author: currentUserId, _id: commentId },
    { content },
    { new: true }
  );

  return sendResponse(
    res,
    200,
    true,
    comment,
    false,
    "Update single Comment successfully"
  );
});

commentControllers.deleteSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;

  let comment = await Comment.findById(commentId);
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not Authorized",
      "Update single Comment error"
    );

  comment = await Comment.findByIdAndDelete(
    { author: currentUserId, _id: commentId },
    { new: true }
  );

  await calculateCommentCount(comment.post);

  return sendResponse(
    res,
    200,
    true,
    comment,
    false,
    "Delete single Comment successfully"
  );
});

commentControllers.getSingleComment = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const commentId = req.params.id;

  let comment = await Comment.findById(commentId);
  if (!comment)
    throw new AppError(400, "Comment not found", "Get single Comment error");

  return sendResponse(
    res,
    200,
    true,
    comment,
    false,
    "Get Comment successfully"
  );
});
module.exports = commentControllers;
