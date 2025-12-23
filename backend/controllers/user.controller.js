import  User  from '../model/user.model.js';
import Notification from '../model/notification.model.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

export const getUserProfile = async(req, res) => {
    const {username}= req.params;
    // Logic to fetch user profile by username
    try {
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user.username);
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const followUnfollowUser = async(req, res) => {
    try {
        const {id}= req.params;
        const userToModify= await User.findById(id);
        const currentUser= await User.findById(req.user._id);
        if(id=== req.user._id.toString()){
            return res.status(400).json({message: 'You cannot follow/unfollow yourself'});
        }
        if(!userToModify||!currentUser){
            return res.status(404).json({message: 'User to follow/unfollow not found'});
        }
        const isFollowing= currentUser.following.includes(id);
        if(isFollowing){
            // Unfollow logic
            currentUser.following.pull(id);
            userToModify.followers.pull(req.user._id);
            await currentUser.save();
            await userToModify.save();
            return  res.status(200).json({message: `You have unfollowed ${userToModify.username}`});
        }
        else{
            // Follow logic
            currentUser.following.push(id);
            userToModify.followers.push(req.user._id);
            await currentUser.save();
            await userToModify.save();
            //send notification
            const notification=  new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id,
            });
            await notification.save();
            
            return res.status(200).json({message: `You are now following ${userToModify.username}`});
        }
}
catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
}
}
export const getSuggestedUsers = async(req, res) => {
    try {
        const userId= req.user._id;
        const userFollwedByMe= await User.findById(userId).select('following');

        const users = await User.aggregate([
            { $match:{_id:{$ne:userId}}},
            {$sample: { size: 10 }},//randomly select 10 users
        ]);
        const filteredUsers= users.filter((user)=> !userFollwedByMe.following.includes(user._id));
        const suggestedUser= filteredUsers.slice(0,4);//return only 4 users
        suggestedUser.forEach((user)=>{
            user.password= null;
        });
        res.status(200).json(suggestedUser);//returning an array of suggested users
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
export const updateUser = async (req, res) => {
  try {
    console.log("UpdateUser called");
    const userId = req.user._id;
    console.log("User ID:", userId);

    const { fullName, email, username, bio, link, currentPassword, newPassword } = req.body;
    let { profileImg, coverImg } = req.body;

    let user = await User.findById(userId);
    console.log("User found:", !!user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // password logic
    if (newPassword && currentPassword) {
      console.log("Password change requested");
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      console.log("Password match:", isMatch);
    }

    // profile image logic
    if (profileImg) {
      console.log("Uploading profile image...");
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      console.log("Profile uploaded:", uploadedResponse.secure_url);
      profileImg = uploadedResponse.secure_url;
    }

    // cover image logic
    if (coverImg) {
      console.log("Uploading cover image...");
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      console.log("Cover uploaded:", uploadedResponse.secure_url);
      coverImg = uploadedResponse.secure_url;
    }

    // save user
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    console.log("User saved");

    user.password = null;
    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("UpdateUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


