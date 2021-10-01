const Blog = require('../models/blogModel.js');
const Auth = require('../models/authModel.js');
const slugify = require('slugify');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Comment = require('../models/blogComments')

dotenv.config()
const JWT_SECRET = process.env.SECRET_KEY

const createBlog = async(req,res) => {
  try{
      const{title, content, category, keywords} = req.body;
      req.body.headerImage = req.file ? req.file.path.replace(/\\/g, '/').substr(14) : '';
      const blogId = slugify(req.body.title);
      const token = req.header("x-auth-token")
      const user = jwt.verify(token, JWT_SECRET);
      const userid = user._id;
      const currentUser = await Auth.findById(userid);
            const checkPermission = currentUser.permissions.find(x => x.section === 'blog' && x.create === true) ? true : false;
            

            if(checkPermission){
                const result = await Blog.create({
                    title: title,
                    content: content,
                    category: category,
                    blogId: blogId,
                    userid: userid,
                    keywords: keywords,
                    headerImage: req.body.headerImage
                });

                return res.status(201).json({
                    status: "201",
                    data: {
                        result
                    }
                })
            } else {
                return res.send("you don't have permission to create blogs")
            }
        } catch(e){
      console.log(e)
      return res.status(500).json({
          message: 'error'
      })
  }
}

//  get all the blogs

const getAllBlogs = async(req,res)=>{

    try{
         // first build the query and then execute 
         const queryObj = {...req.query}
         const excludeFields = ['sort','fields','page','limit']
         excludeFields.forEach(el => delete queryObj[el])
 
          // pagination 
          const page = req.query.page * 1 || 1
          const limit = req.query.limit *1 || 100
          const skip =(page- 1)* limit

         let query =  await Blog.find(queryObj).skip(skip).limit(limit).populate('comments')
 
         if(req.query.page){
             const numblogs = await Blog.countDocuments()
             if(skip >= numblogs) throw new Error('this page doesn not exists')
         }
 
         const blog = await query
         return res.status(200).json({
             status: "200",
             data:{
                 blog
             }
         })
    
    } catch(e){
        console.log(e);
        return res.status(500).json({
            message: 'server error'
        })

}
}
// Get blog by ID
const getBlog = async(req,res)=>{
    try{
        let blog = await Blog.findById(req.params.id).populate('comments');
        if(!blog) {
            return res.status(404).json({
                message: 'Blog not found'
            })
        }
        return res.status(201).json(blog)
    } catch(e){
        console.log(e);
        return res.status(500).json({
            message: 'server error'
        })
    }
    
}
// Update blog by ID

const updateBlog = async(req,res)=>{
    try{
        let blog = await Blog.findById(req.params.id);
        if(!blog) {
            return res.status(404).json({
                message: 'Blog not found'
            })
        }
        const {body,title} = req.body;
        if(body) blog.body = body;
        if(title) blog.title = title;
        const token = req.header("x-auth-token")
        const user = jwt.verify(token, JWT_SECRET);
        const _id = user._id;
        const currentUser = await Auth.findById(_id);
        
          const checkPermission = currentUser.permissions.find(x => x.section === 'blog' && x.update === true) ? true : false;
          
          if(checkPermission){
            return res.status(201).json({
              status: "201",
              data: {
                  blog
              }
            })
          } else {
            return res.send("you don't have permission to update blogs")
          }
        
    } catch(e){
      console.log(e)
        res.status(500).json({
            message: 'server error'
        })
    }
}
// Delete blog by ID
const deleteBlog = async(req,res)=>{
    try{
        const blog = await Blog.findById(req.params.id);
        if(!blog) {
            return res.status(404).json({
                message: 'Blog not found'
            })
        }
        const token = req.header("x-auth-token")
        const user = jwt.verify(token, JWT_SECRET);
        const _id = user._id;
        const currentUser = await Auth.findById(_id);
        
          const checkPermission = currentUser.permissions.find(x => x.section === 'blog' && x.delete === true) ? true : false;
          
          if(checkPermission){
            await blog.remove();
            return res.status(410).json({
              status: "410",
              message: "Blog Deleted"
            })
          } else {
            return res.send("you don't have permission to delete blogs")
          }
    } catch(e){
        res.status(500).json({
            message: 'server error'
        })
    }
}
// Add comments on Blogs by ID
const addComment = async (req, res) => {
    try {
      let blog = await Blog.findById(req.params.id);
  
      if (!blog) {
        return res.status(404).json({ 
            status: "404",
            message: 'No blog with that Id' });
      }
  
      if (!req.body.content) {
        return res
          .status(500)
          .json({ 
            status:"500",  
            message: 'Comment Content Can Not Be Empty' });
      }

      const token = req.header("x-auth-token")
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user._id;
  
      const newComment = new Comment({
        content: req.body.content,
        user: userid,
        blogId: req.params.id,
      });
  
      const comment = await newComment.save();
  
      blog.comments.unshift(comment.id);
  
      blog = await blog.save();
  
      return res.status(200).json({
          status: "200",
          data:
          blog
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: 'Server Error',
      });
    }
  };
  // like or unlike a comment by commnet id
 const likeUnlikeComment = async (req, res) => {
    try {
      let comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({
            status: "404",
          message: 'No comment with that ID',
        });
      }

      const token = req.header("x-auth-token")
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user._id;
  
      if (!comment.likes.find((like) => like.user.toString() === userid)) {
        comment.likes.unshift({ user: userid });
      } else {
        comment.likes = comment.likes.filter(
          (like) => like.user.toString() !== userid
        );
      }
  
      comment = await comment.save();
  
      return res.status(200).json({
        status: "200",
        comment
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Server Error',
        err: err.message,
      });
    }
  };
  
// reply to comment by comment id
const replyToComment = async (req, res) => {
    try {
      let comment = await Comment.findById(req.params.commentId);
      if (!comment) {
        return res.status(404).json({
          message: 'No comment with that ID',
        });
      }
      const token = req.header("x-auth-token")
      const user = jwt.verify(token, JWT_SECRET);
      const userid = user._id;
      
      if (!req.body.content) {
        return res
          .status(500)
          .json({ message: 'Reply Content Can Not Be Empty' });
      }
  
      const reply = {
        user: userid,
        content: req.body.content,
      };
  
      comment.replies.unshift(reply);
  
      comment = await comment.save();
  
      return res.status(200).json(comment);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: 'Server Error',
      });
    }
  };
  


module.exports = {
    createBlog,
    getAllBlogs,
    getBlog,
    updateBlog,
    deleteBlog,
    addComment,
    likeUnlikeComment,
    replyToComment
}
