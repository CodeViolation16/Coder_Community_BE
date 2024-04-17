const Reaction = require("../models/Reaction");
const reactionControllers = {};
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const mongoose = require("mongoose")

const calculateReactions = async (targetType, targetId) => {
  const stats = await Reaction.aggregate([
    {
      $match: { targetId: new mongoose.Types.ObjectId(targetId) },
    },
    {
      $group: {
        _id: "$targetId",
        like: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "like"] }, 1, 0],
          },
        },
        dislike: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "dislike"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const reactions = {
    like: (stats[0] && stats[0].like) || 0,
    dislike: (stats[0] && stats[0].dislike) || 0,
  };
  await mongoose.model(targetType).findByIdAndUpdate(targetId, { reactions });

  return reactions;
};

reactionControllers.saveReaction = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const { targetType, targetId, emoji } = req.body;

  // Check targetType exist
  const targetObject = mongoose.model(targetType).findById(targetId);
  if (!targetObject)
    throw new AppError(400, `${targetType} not found`, "Create reaction error");

  // Find the reaction if exist
  let reaction = await Reaction.findOne({
    targetType,
    targetId,
    author: currentUserId,
  });

  //   If there is no reaction in DB -> create new reaction
  if (!reaction) {
    reaction = await Reaction.create({
      targetType,
      targetId,
      author: currentUserId,
      emoji,
    });
  } else {
    // If there is reaction -> compare emoji
    if (reaction.emoji === emoji) {
      // If they are the same -> delete
      await reaction.delete();
    } else {
      // If they are difference -> update reaction
      reaction.emoji = emoji;
      await reaction.save();
    }
  }

  const reactions = await calculateReactions(targetType, targetId);

  // Response
  return sendResponse(
    res,
    200,
    true,
    reactions,
    false,
    "Save Reaction successfully"
  );
});

module.exports = reactionControllers;
