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
    return res.status(404).json(new ApiResponse(404, "Problem not found"));
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
    return res.status(404).json(new ApiResponse(404, "No problems found"));
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
      new ApiResponse(
        200,
        inActiveProblems,
        "Inactive problems fetched successfully",
      ),
    );
});

/* -------------------------------Sheet Controllers------------------------*/

/*-----------------Create Sheet---------*/
const createSheetController = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "Invalid Input Fields",
          "Title is required for the sheet",
        ),
      );
  }

  const slug = generateSlug(title);
  const newSheet = await prisma.sheet.create({
    data: {
      title,
      description,
      slug,
    },
  });

  if (!newSheet) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "Internal Server Error",
          "Unable to create the sheet at the moment",
        ),
      );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newSheet, "New Sheet Created Successfully"));
});

/*--------------Adding subsection to the sheet-------------------*/
const createSheetSection = asyncHandler(async (req, res) => {
  const { sheetSlug } = req.params;
  const { title, description } = req.body;
  /*
   firstly we need to find the sheet with the given slug
   then we need to find the last order of the sections that has been created in the sheet
  then create a new section with order + 1
  */

  const sheetFromSlug = await prisma.sheet.findUnique({
    where: {
      slug: sheetSlug,
    },
  });

  if (!sheetFromSlug) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "Sheet Not Found",
          "No sheet found with the given slug",
        ),
      );
  }

  // finding the last order of the sections in the sheet
  const lastOrder = await prisma.sheetSection.findFirst({
    where: {
      sheetId: sheetFromSlug.id,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  // adding 1 to last order
  const curOrder = lastOrder ? lastOrder.order + 1 : 1;

  const newSectionInSheet = await prisma.sheetSection.create({
    data: {
      title,
      description,
      order: curOrder,
      sheetId: sheetFromSlug.id,
    },
  });

  if (!newSection) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Internal Server Error",
          "Unable to create section in the sheet at the moment",
        ),
      );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newSectionInSheet,
        "New Section Created in the Sheet Successfully",
      ),
    );

  const newSection = await prisma.sheetSection.create({});
  // problems here would be an array having slugs of the problems that are supposed to be added in the sheet
});

/*-----------------Adding problems to the section in the sheet-------------------*/
const addProblemsToSection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const { problems } = req.body;

  if (!Array.isArray(problems) || problems.length === 0)
    return res
      .status(400)
      .json(new ApiResponse(400, "Problems array required"));

  const result = await prisma.$transaction(async (tx) => {
    /* 1️⃣ Verify section */
    const section = await tx.sheetSection.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      return res.status(404).json(new ApiResponse(404, null,"Section not found",));
    }

    /* 2️⃣ Fetch problems */
    const problemRecords = await tx.problem.findMany({
      where: { slug: { in: problems }, isActive: true },
      select: { id: true },
    });

    if (problemRecords.length === 0){
      return res.status(404).json(new ApiResponse(404,null, "No valid problems found to add"));
    }

    /* 3️⃣ Get last order */
    const last = await tx.sectionProblem.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    let order = last ? last.order + 1 : 1;

    /* 4️⃣ Bulk insert */
    const mappings = problemRecords.map((p) => ({
      sectionId,
      problemId: p.id,
      order: order++,
    }));

    await tx.sectionProblem.createMany({
      data: mappings,
      skipDuplicates: true,
    });

    return mappings.length;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Problems added to section"));
});





/* ------------------------------------------------------------------------ */

export {
  isAdmin,
  createProblemController,
  deleteProblemController,
  updateProblemController,
  getAllProblemsController,
  getInactiveProblemsController,
  createSheetController,
  createSheetSection,
  addProblemsToSection  
};
