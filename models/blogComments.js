const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      requried: true,
    },
    content: {
      type: String,
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'post',
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
      },
    ],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
  }
);

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment