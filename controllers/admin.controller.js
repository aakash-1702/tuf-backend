import ApiResponse from "../utils/ApiResponse.js";
import generateSlug from "../utils/genereateSlug.utils.js";
import asyncHandler from "../utils/asyncHandler.js";
import { prisma } from "../lib/prisma.js";

/* -------------------- ADMIN CHECK -------------------- */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json(new ApiResponse(403, "Forbidden", "Admin access required"));
  }
  next();
};

/************* Problems Controllers */
/* -------------------- CREATE PROBLEM -------------------- */
const createProblemController = asyncHandler(async (req, res) => {
  const { title, description, difficulty, tags, link, companies } = req.body;

  if (!title || !difficulty) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Title and difficulty are required"));
  }

  let slug = generateSlug(title);

  // prevent slug collision
  const existing = await prisma.problem.findUnique({ where: { slug } });
  if (existing) slug = slug + "-" + Date.now();

  const newProblem = await prisma.problem.create({
    data: {
      title,
      description,
      difficulty,
      tags,
      link,
      slug,
      companies,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newProblem, "Problem created successfully"));
});

/* -------------------- DELETE (SOFT DELETE) -------------------- */
const deleteProblemController = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const problem = await prisma.problem.findFirst({
    where: { slug, isActive: true },
  });

  if (!problem) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Problem not found or already deleted"));
  }

  const deletedProblem = await prisma.problem.update({
    where: { slug },
    data: { isActive: false },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedProblem, "Problem deleted successfully"));
});

/* -------------------- UPDATE PROBLEM -------------------- */
const updateProblemController = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const problem = await prisma.problem.findFirst({
    where: { slug, isActive: true },
  });

  if (!problem) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Problem not found"));
  }

  const updatedData = {};
  const allowedFields = [
    "title",
    "description",
    "difficulty",
    "tags",
    "link",
    "companies",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updatedData[field] = req.body[field];
    }
  }

  // handle title → slug change safely
  if (updatedData.title) {
    let newSlug = generateSlug(updatedData.title);

    const existing = await prisma.problem.findUnique({
      where: { slug: newSlug },
    });

    if (existing && existing.slug !== slug) {
      newSlug += "-" + Date.now();
    }

    updatedData.slug = newSlug;
  }

  const updatedProblem = await prisma.problem.update({
    where: { slug },
    data: updatedData,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProblem, "Problem updated successfully"));
});

/* -------------------- GET ACTIVE PROBLEMS (PUBLIC) -------------------- */
const getAllProblemsController = asyncHandler(async (req, res) => {
  const problems = await prisma.problem.findMany({
    where: { isActive: true },
  });

  if (problems.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No problems found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problems, "Problems fetched successfully"));
});

/* -------------------- GET INACTIVE PROBLEMS (ADMIN) -------------------- */
const getInactiveProblemsController = asyncHandler(async (req, res) => {
  const inActiveProblems = await prisma.problem.findMany({
    where: { isActive: false },
  });

  if (inActiveProblems.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No inactive problems found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, inActiveProblems, "Inactive problems fetched successfully")
    );
});




/* -------------------------------Sheet Controllers------------------------*/



/* ------------------------------------------------------------------------ */


export {
  isAdmin,
  createProblemController,
  deleteProblemController,
  updateProblemController,
  getAllProblemsController,
  getInactiveProblemsController,
};
