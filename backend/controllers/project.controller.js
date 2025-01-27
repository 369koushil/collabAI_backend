import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';


export const createProject = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { name,description,visibility } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;

        const newProject = await projectService.createProject({ name,description,visibility, userId });

        res.status(201).json(newProject);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }



}

export const getAllProject = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }


}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}


export const addUserById=async(req,res)=>{
    const user=req.query.filter||"";
    try{
        
        // console.log(req.user)
        const selectuser=await projectService.addUserById(user,req.user.email);
        return res.status(200).json({selectuser})

    }
    catch(err){
        console.log(err);
        return res.status(400).json([err])
    }
}


export const getPublicProjects=async(req,res)=>{
    try{
        const publicProjects=await projectService.getPublicProjects();
        return res.status(200).json({publicProjects})
    }catch(err){
        console.log(err.message);
        return res.json({err:err.message})
    }
}


export const editProject=async(req,res)=>{

       const {projectId,name,description,visibility}=req.body;
       const email=req.user.email;
    try{
        const userId=await userModel.findOne({email})
        const editedInfo=await projectService.editProject(projectId,name,description,visibility,userId._id);
        return res.status(200).json({editedInfo})
    }catch(err){
        res.status(400).json({err:err.message})
    }
}

export const deleteProject=async(req,res)=>{
    const projectId=req.params.pId;
    const email=req.user.email;

    try{
        const userId=await userModel.findOne({email})
        const result=await projectService.deleteProject(projectId,userId._id);
        res.status(200).json({msg:"deleted succesfully",result})
    }catch(err){
        res.status(400).json({err:err.message})
    }
}



export const makeNewAdmin= async(req,res)=>{
    try{
        
      const email=req.user.email;
      console.log(email)
      const {users,projectId}=req.body;
      const userId=await userModel.findOne({email});
      const newAdmins=await projectService.makeNewAdmin(users,projectId,userId._id)

      if(!newAdmins){
        res.status(400).json({msg:"erro occured while updating"})
      }
      res.status(200).json({newAdmins})
      
    }catch(err){
      res.status(400).json({err:err.message})
    }
}


export const getUserProjects=async(req,res)=>{
    try{
        const email=req.user.email;
        const user=await userModel.findOne({email})
        if(!user)res.status(400).json("error ocured ")
        const userProjects=await projectModel.find({creator:user._id})
    if(!userProjects)res.status(400).json("erro occured")
        res.status(200).json({userProjects});
    }catch(err){
        res.status(400).json({err:err.message})
    }
}



export const getProjectByName=async(req,res)=>{
    try{
        const name=req.params.projectname;
         const searchArr=await projectService.getProjectByName(name);
         res.status(200).json(searchArr)
    }catch(err){
        return res.status(400).json(err)
    }
}



export const fetchPublicProjects=async(req,res)=>{
    try{
   const page=req.params.page
   const searchres=await projectService.fetchPublicProjects(page);
   
   res.status(200).json(searchres);
    }catch(err){
        console.log(err)
        res.status(400).json(err.message)
    }
}