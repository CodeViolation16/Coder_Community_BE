const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String, required: false, default: "" },
    coverUrl: { type: String, required: false, default: "" },
    aboutMe: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    country: { type: String, required: false, default: "" },
    company: { type: String, required: false, default: "" },
    jobTitle: { type: String, required: false, default: "" },
    facebookLink: { type: String, required: false, default: "" },
    instagramLink: { type: String, required: false, default: "" },
    linkedinLink: { type: String, required: false, default: "" },
    twitterLink: { type: String, required: false, default: "" },
    isDeleted: { type: Boolean, default: false, select: false },
    friendCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  return user;
};
userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
