import userModel from '../models/user.model.js';



export const createUser = async ({
   username, email, password
}) => {

    if (!email || !password||!username) {
        throw new Error('Email ,username and password are required');
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        email,
        password: hashedPassword,
        username,
       
    });

    return user;

}

export const getAllUsers = async ({ userId }) => {
    const users = await userModel.find({
        _id: { $ne: userId }
    });
    return users;
}



export const profileService = async (email) => {
  const user = await userModel.findOne({ email });

  if (user) {
      user.socialProfiles = {
          linkedin: user.socialProfiles?.linkedin || "https://www.linkedin.com/in/your-profile",
          twitter: user.socialProfiles?.twitter || "https://twitter.com/your-handle",
          reddit: user.socialProfiles?.reddit || "https://reddit.com/user/your-profile",
      };

      user.bio = user.bio || "No bio available";
  }

  return user;
};



export const updateProfile = async (body, email) => {
  const { username, bio, socialProfiles } = body;

  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { email }, // Find user by email
      {
        username,
        bio,
        socialProfiles, // This will update nested fields in socialProfiles
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on update
      }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw error;
  }
};
