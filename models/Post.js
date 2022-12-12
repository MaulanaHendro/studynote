const mongoose = require("mongoose");

const postSchema = {
  title: String,
  subject: String,
  question: String,
  content: String,
  summary: String,
  userId: String,
  username: String,
};

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
