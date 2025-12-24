import e from "express"
import User from "../model/user.model.js";
import Post from "../model/post.model.js";
import Notification from "../model/notification.model.js";
import {v2 as cloudinary} from 'cloudinary';
export const createPost = async (req, res) => {
    try{
        const {text}= req.body;
        let {image}= req.body;
        const userId= req.user._id.toString();
        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(!text && !image){
            return res.status(400).json({message:"Post cannot be empty"});
        }
        if(image){
            const uploadResponse= await cloudinary.uploader.upload(image)
            image= uploadResponse.secure_url;
        }
        const newPost= new Post({
            user: userId,
            text,
            image: image
        });
        await newPost.save();
        return res.status(201).json({message:"Post created successfully", post:newPost});
    }
    catch(err){
        console.error("Error creating post:", err);
        return res.status(500).json({message:"Internal server error"});
    }
}
export const likeunlikePost = async (req, res) => {
    try{
        const userId=req.user._id.toString();;
        const {id:postId}=req.params;
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        const userLikedPost = post.likes.includes(userId)
        if(userLikedPost){// wants to unlike the post
           await Post.updateOne({_id:postId},{$pull:{likes:userId}})
           await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
           return res.status(200).json({message : "post unliked"})
        }
        else{
            post.likes.push(userId);
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}})
            await post.save();

            const notification =new Notification({
                from:userId,
                to:post.user,
                type:"like",
            })
            await notification.save();
             return  res.status(200).json({message:"p0st as been liked"})
         }
    }
    catch(err){
        console.error("Error liking the  post:", err);
        return res.status(500).json({message:"Internal server error liking"});
    }

}
export const commentOnPost = async (req, res) => {
    try{
        const {text}=req.body;
        const postId=req.params.id;
        const userId=req.user._id.toString();
        if(!text){
            return res.status(400).json({error:"text field is req"})
        }
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        const comment = {user:userId,text}
        post.commments.push(comment)
        await post.save()
        return res.status(200).json({ message: "Comment added successfully",
        post
})
    }
    catch(err){
        console.error("Error commenting on post:", err);
        return res.status(500).json({error:"error in commenting"});
    }

}
export const deletePost = async (req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(403).json({error:"you are not authorized to delete"})
        }
        if(post.image){
            console.log("Image deleting")
            const imgId = post.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({message:"post as been deleted"})
    }
    catch(err){
        console.error("Error creating deleting post:", err);
        return res.status(500).json({message:"Internal server error"});
    }
}
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user._id.toString();

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.commments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (
      comment.user.toString() !== userId &&
      post.user.toString() !== userId
    ) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    // ✅ Use pull instead of remove
    post.commments.pull(commentId);
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully", post });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(500).json({ error: "Internal server error while deleting comment" });
  }
};
export const getAllPosts = async(req,res)=>{
   try{
    const posts = await Post.find().sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"
    }).populate({
        path:"commments.user",
        select:"-password"
    })
    if (posts.length===0){
        return res.status(200).json([])
    }
    return res.status(200).json(posts)
    }
    catch (err) {
    console.error("Error getting the post", err);
    return res.status(500).json({ error: "Internal server error while getting the post" });
  }
}
export const getLikedPosts  = async(req,res)=>{
    const userId=req.params.id
    try{
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({error:"user not found"})
        const likedPosts = await Post.find({_id:{$in:user.likedPosts}}).populate({
        path:"user",
        select:"-password"
    }).populate({
        path:"commments.user",
        select:"-password"
    });
    return res.status(200).json(likedPosts);
    }
    catch (err) {
    console.error("Error getting the liked post", err);
    return res.status(500).json({ error: "Internal server error while getting the post" });
  }

}
export const getFollowingPost =async(req,res)=>{
    try{
        const userId=req.user._id;
        const user =await User.findById(userId);
        if(!user) return res.status(404).json({error:"User not found"});
        const following = user.following
        const feedposts = await Post.find({user:{$in:following}}).sort({createdAt:-1}).populate({
        path:"user",
        select:"-password"
    }).populate({
        path:"commments.user",
        select:"-password"
    });
    return res.status(200).json(feedposts);
    }
    catch (err) {
    console.error("Error getting the folloowing post", err);
    return res.status(500).json({ error: "Internal server error while getting following posts" });
  }
}
export const getUserPosts = async(req,res)=>{
    try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password"
      })
      .populate({
        path: "commments.user",
        select: "-password"
      });

    return res.status(200).json(posts);
  } catch (err) {
    console.error("Error getting user posts:", err);
    return res.status(500).json({ error: "Internal server error while getting user posts" });
  }


}