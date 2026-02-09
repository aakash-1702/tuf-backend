import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
const adminRouter = Router();
import {
  isAdmin,
  createProblemController,
  deleteProblemController,
  updateProblemController,
  getAllProblemsController,
  getInactiveProblemsController,
  createSheetController,
  createSheetSection,
  addProblemsToSection
} from "../controllers/admin.controller.js";

/*---------Routes for problems*/
adminRouter.post(
  "/create-problem",
  isAuthenticated,
  isAdmin,
  createProblemController,
);
adminRouter.delete(
  "/delete-problem/:slug",
  isAuthenticated,
  isAdmin,
  deleteProblemController,
);
adminRouter.get(
  "/get-all-problems",
  isAuthenticated,
  isAdmin,
  getAllProblemsController,
);
adminRouter.get(
  "/get-inactive-problems",
  isAuthenticated,
  isAdmin,
  getInactiveProblemsController,
);
adminRouter.put(
  "/update-problem/:slug",
  isAuthenticated,
  isAdmin,
  updateProblemController,
);

/*---------Routes for sheets */
adminRouter.post(
  "/sheet/:sheetSlug/create-section",
  isAuthenticated,
  isAdmin,
  createSheetController,
);
adminRouter.post(
  "/sheet/:sheetSlug/section/create-subsection",
  isAuthenticated,
  isAdmin,
  createSheetSection,
);
adminRouter.post(
  "/section/:sectionId/add-problems",
  isAuthenticated,
  isAdmin,
  addProblemsToSection,
);
export default adminRouter;
