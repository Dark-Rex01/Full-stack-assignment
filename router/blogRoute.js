const express = require('express')
const Blog = require('../models/blogModel')
const blog = require('../controller/blog')
const { updateBlog } = require('../controller/blog')
const upload = require('../utils/multer')

const router= express.Router()

// create blog
router.post('/',  upload.single('file'), blog.createBlog)
// getall blog
router.get('/', blog.getAllBlogs)
//  get blog
router.get('/:id',blog.getBlog)
// update blog
router.put('/:id', blog.updateBlog)
// delete blog
router.delete('/:id', blog.deleteBlog)
// add a comment
router.put('/:id/addcomment', blog.addComment)
// like unlike a commnet
router.put('/:id/likeunlikecomment', blog.likeUnlikeComment)
// reply to a comment 
router.put('/addReply/:commentId', blog.replyToComment)

   

module.exports = router;