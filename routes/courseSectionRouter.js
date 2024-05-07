const express = require("express");
const isAuthenticated = require("../middlewares/isAuth");
const courseSectionCtrl = require("../controllers/courseSectionCtrl");

const courseSectionRouter = express.Router();

// ! Create New Sections
courseSectionRouter.post(
  "/api/v1/course-sections/create/:courseId",
  isAuthenticated,
  courseSectionCtrl.create
);
// ! Get All Sections
courseSectionRouter.get(
  "/api/v1/course-sections",
  // isAuthenticated,
  courseSectionCtrl.lists
);
// ! Update Section
courseSectionRouter.put(
  "/api/v1/course-sections/:sectionId",
  // isAuthenticated,
  // isInstructor,
  courseSectionCtrl.update
);
// ! Get Section By Id
courseSectionRouter.get(
  "/api/v1/course-sections/:sectionId",
  courseSectionCtrl.getSection
);
// ! Delete Section
courseSectionRouter.delete(
  "/api/v1/course-sections/:sectionId",
  // isAuthenticated,
  // isInstructor,
  courseSectionCtrl.delete
);

module.exports = courseSectionRouter;
