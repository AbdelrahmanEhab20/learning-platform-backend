const express = require("express");
const isAuthenticated = require("../middlewares/isAuth");
const progressCtrl = require("../controllers/progressController");

const progressRouter = express.Router();

// ! Apply for course
progressRouter.post(
  "/api/v1/progress/apply",
  isAuthenticated,
  progressCtrl.applyToCourse
);
// ! Start section
progressRouter.put(
  "/api/v1/progress/start-section",
  isAuthenticated,
  progressCtrl.startSection
);
// ! update section progress router
progressRouter.post(
  "/api/v1/progress/update",
  isAuthenticated,
  progressCtrl.updateProgress
);
module.exports = progressRouter;
