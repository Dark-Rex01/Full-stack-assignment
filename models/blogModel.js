const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        reqired: true,

    },content: {
        type: String,
        required: true
      },
      category: {
          type: String,
          required: true
      },
      blogId :{
        type: String,
        lowerCase: true   
      },
      user:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'auth'
      },keywords:{
          type: String,
          required: true
      },
      headerImage: {
          type: String
      },
      source:{
            type: String
      },
      comments: [
          {
              type:mongoose.Schema.Types.ObjectId,
              ref: 'comment'
          }
      ]


})

const Blog = mongoose.model('Blog', blogSchema); 

module.exports = Blog
