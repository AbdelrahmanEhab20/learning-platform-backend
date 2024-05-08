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
    // ! Push the user to the course students
    courseFound.students.push(userId);
    // ? update and re save course
    await courseFound.save();
    // ! Send the result
    return res
      .status(200)
      .json({ message: "Applied process for this course done successfully" });
  }),
  // ! Start a section
  startSection: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { courseId, sectionId } = req.body;
    // ! Find the user
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(404).json({ message: "User Not Found" });
    }
    // ! Find the course progress and compare
    const courseProgress = userFound.progress.find(
      (prog) => prog.courseId.toString() === courseId.toString()
    );
    if (!courseProgress) {
      return res
        .status(404)
        .json({ message: "Course not found in user's progress" });
    }
    // ! Check if section is already started
    const isSectionExisted = courseProgress.sections.find(
      (sec) => sec.sectionId.toString() === sectionId.toString()
    );
    if (isSectionExisted) {
      return res.status(400).json({ message: "Section already started" });
    }
    // ! Check if section is already started
    courseProgress.sections.push({ sectionId, status: "Not Started" });
    courseProgress.save();
    userFound.save();
    // ! Send the result
    return res.status(200).json({ message: "Section started successfully" });
  }),
};

module.exports = progressController;
