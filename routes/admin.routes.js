import {Router} from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.middleware.js';
const adminRouter = Router();
import {isAdmin , createProblemController , deleteProblemController , updateProblemController , getAllProblemsController , getInactiveProblemsController} from '../controllers/admin.controller.js';

adminRouter.post('/create-problem',isAuthenticated,isAdmin,createProblemController);
adminRouter.delete('/delete-problem/:slug',isAuthenticated,isAdmin,deleteProblemController);
adminRouter.get('/get-all-problems',isAuthenticated,isAdmin,getAllProblemsController);
adminRouter.get('/get-inactive-problems',isAuthenticated,isAdmin,getInactiveProblemsController);
adminRouter.put('/update-problem/:slug',isAuthenticated,isAdmin,updateProblemController);

export default adminRouter; 