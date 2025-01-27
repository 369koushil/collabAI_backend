import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js';

const router = Router();


router.post('/create',
    authMiddleWare.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
)

router.get('/all',
    authMiddleWare.authUser,
    projectController.getAllProject
)

router.put('/add-user',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/getby-username',authMiddleWare.authUser,projectController.addUserById);
router.get('/get-project/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectById
)

router.put('/update-file-tree',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
)

router.get('/public-projects',authMiddleWare.authUser,projectController.getPublicProjects)


router.put('/edit-project',authMiddleWare.authUser,projectController.editProject);
router.delete('/delete-project',authMiddleWare.authUser,projectController.deleteProject);
router.put('/make-admins',authMiddleWare.authUser,projectController.makeNewAdmin);
router.get('/getuserprojects',authMiddleWare.authUser,projectController.getUserProjects)
router.get('/get-project-name/:projectname',authMiddleWare.authUser,projectController.getProjectByName);
router.get('/get-public-projects/:page',authMiddleWare.authUser,projectController.fetchPublicProjects);
export default router;

