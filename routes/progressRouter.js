const express = require("express");
const isAuthenticated = require("../middlewares/isAuth");
const progressCtrl = require("../controllers/progressController");
const { isStudent } = require("../middlewares/roleAccessMiddleware");

const progressRouter = express.Router();

// ! Apply for course
progressRouter.post(
  "/api/v1/progress/apply",
  isAuthenticated,
  isStudent,
  progressCtrl.applyToCourse
);
// ! Start section
progressRouter.put(
  "/api/v1/progress/start-section",
  isAuthenticated,
  isStudent,
  progressCtrl.startSection
);
// ! update section progress router
progressRouter.post(
  "/api/v1/progress/update",
  isAuthenticated,
  isStudent,
  progressCtrl.updateProgress
);
module.exports = progressRouter;
