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

module.exports = progressRouter;
