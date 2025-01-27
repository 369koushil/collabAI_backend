import mongoose from 'mongoose';


const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: [ true, 'Project name must be unique' ],
    },

    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    fileTree: {
        type: Object,
        default: {}
    },
    description:{
        type:String,
        required:true
    },
    visibility:{
        type:String,
        default:"private"
    },
    admins:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'user'
        }
    ],
    creator:{
        type:mongoose.Schema.ObjectId,
        ref:'user'
    }

})


const Project = mongoose.model('project', projectSchema)


export default Project;