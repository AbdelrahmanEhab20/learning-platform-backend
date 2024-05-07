const express = require("express");
const courseCtrl = require("../controllers/courseController");
const courseRouter = express.Router();
const isAuthenticated = require("../middlewares/isAuth");
// ! create router
courseRouter.post("/api/v1/courses/create", isAuthenticated, courseCtrl.create);
// !  Get all courses router
courseRouter.get("/api/v1/courses/list", courseCtrl.lists);
// !  Get a single course by id router
courseRouter.get("/api/v1/courses/:courseId", courseCtrl.getCourseById);
// !  Find Course By Id And Update it
courseRouter.put("/api/v1/courses/:courseId", courseCtrl.update);
// !  Find Course By Id And Update it
courseRouter.delete("/api/v1/courses/:courseId", courseCtrl.delete);

module.exports = courseRouter;
