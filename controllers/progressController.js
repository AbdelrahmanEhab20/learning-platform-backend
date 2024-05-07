const asyncHandler = require("express-async-handler");
const Course = require("../model/Course");
const mongoose = require("mongoose");
const CourseSection = require("../model/CourseSection");
const User = require("../model/User");

const progressController = {
  // ! Apply to a course
  applyToCourse: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { courseId } = req.body;
    // ! Find the user
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(404).json({ message: "User Not Found" });
    }
    // ! Check if the user is already enrolled in the course
    const isAlreadyEnrolled = userFound.progress.some(
      (progress) => progress.courseId.toString() === courseId.toString()
    );
    if (isAlreadyEnrolled) {
      return res
        .status(400)
        .json({ message: "You have already enrolled in this course" });
    }
    // ! Validate the course
    const courseFound = await Course.findById(courseId);
    if (!courseFound) {
      return res.status(404).json({ message: "Course Not Found" });
    }
    // ! Add the course to user's progress
    userFound.progress.push({ courseId, sections: [] });
    // ? update and re save user
    await userFound.save();
    // ! Pus the user to the course students
    courseFound.students.push(userId);
    // ? update and re save course
    await courseFound.save();
    return res
      .status(200)
      .json({ message: "Applied process for this course done successfully" });
  }),
};

module.exports = progressController;
