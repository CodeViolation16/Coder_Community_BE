const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendSchema = Schema(
  {
    from: { type: Schema.ObjectId, required: true, ref: "User" },
    to: { type: Schema.ObjectId, required: true, ref: "User" },
    status: { type: String, enum: ["pending", "accepted", "rejected"] },
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);
module.exports = Friend;
