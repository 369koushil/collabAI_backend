import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';
import userModel from '../models/user.model.js';


export const createProject = async ({
    name, description, visibility, userId
}) => {
    if (!name) {
        throw new Error('Name is required')
    }
    if (!userId) {
        throw new Error('UserId is required')
    }

    let project;
    try {
        project = await projectModel.create({
            name,
            description,
            visibility,
            users: [userId],
            admins: [userId],
            creator:userId
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;

}


export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects
}

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log(project)

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject



}

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}




export const addUserById = async (user, userId) => {
    // console.log(userId+"++++")
    // console.log("userid")

    const userarr = await userModel.find({
        $or: [
            {
                username: {
                    $regex: user,
                }
            }
        ]
    })

    const userModif = userarr.filter(u => {
        if (u.email != userId) {
            return {
                email: u.username,
                id: u._id,
            }
        }
    })

    return userModif;

}



export const getPublicProjects = async () => {
    try {
        const res = await projectModel.find({
            visibility: 'public'

        })

        return res;
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export const editProject = async (pId, pName, pDescription, pVisibility, userId) => {
    try {
        const find = await projectModel.findOne({
            _id: pId,
            admins: userId
        })
        const editedInfo = await projectModel.findOneAndUpdate(
            { _id: pId },
            {
                name: pName,
                description: pDescription,
                visibility: pVisibility,
            },
            { new: true }
        );

        if (!editedInfo) {
            throw new Error('Project not found or update failed');
        }

        return editedInfo;
    } catch (error) {
        console.error('Error updating project:', error.message);
        throw error;
    }
};


export const deleteProject = async (pId, userId) => {

    try {
        const find = await projectModel.findOne({
            _id: pId,
            admins: userId
        })
        if (!find) {
            throw new Error("user did not have permision to delete this")
        }
        const res = await projectModel.findOneAndDelete({
            _id: pId
        })
        if (!res) {
            throw new Error('erro while delteing try again')
        }
        return res;
    } catch (err) {
        throw err;
    }
}






export const makeNewAdmin = async (users, projectId, userId) => {
    try {
        const isAdmin = await projectModel.findOne({
            admins: userId
        })

        if (!isAdmin) throw new Error("user should be an admin to make new admin")
        const newAdmins = await projectModel.findOneAndUpdate({
            _id: projectId
        },
            {
                $addToSet: {
                    admins: {
                        $each: users
                    },
                    users:{
                        $each:users
                    }
                }
            }, {
            new: true
        }
        )

        return newAdmins;

    } catch (err) {
        throw err;
    }
}

export const getProjectByName = async (name) => {
    if (!name || typeof name !== 'string') {
        throw new Error("Invalid search name");
    }

    try {
        const searchArr = await projectModel.find({
            visibility:'public',
            name: { $regex: name, $options: 'i' }, 
        });

        return searchArr;
    } catch (err) {
        console.error("Error fetching projects by name:", err.message);
        throw new Error("Failed to search for projects");
    }
};



export const fetchPublicProjects = async (page , limit = 10) => {
    try {
     
      const skip = (page - 1) * limit;
  
    
      const projects = await projectModel.find({ visibility: 'public' })
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit);

        console.log(projects)
  
      
      const totalProjects = await projectModel.countDocuments({ visibility: 'public' });
      
  
     console.log(totalProjects)
      const totalPages = Math.ceil(totalProjects / limit);
  
   
      return {
        projects,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching public projects:', error);
      throw new Error('Failed to fetch public projects');
    }
  };
  
