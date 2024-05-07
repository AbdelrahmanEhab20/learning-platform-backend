const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const Course = require("../model/Course");

const courseCtrl = {
  // ! Create
  create: asyncHandler(async (req, res) => {
    const { title, description, difficulty, duration } = req.body;
    // ! Find the user
    const userFound = await User.findById(req.user);
    if (!userFound) {
      res.status(404);
      throw new Error("User Not Found");
    }
    // if (userFound.role !== "instructor") {
    //   res.status(401);
    //   throw new Error(
    //     "You are not authorized to create course , Instructors Only"
    //   );
    // }
    // ! Validate the user input
    //validation
    if (!title || !description || !difficulty || !duration) {
      throw new Error("Please provide all fields");
    }
    // ! check if the the course already existed
    const courseExisted = await Course.findOne({ title });
    if (courseExisted) {
      throw new Error("Course is already existed");
    }
    // ? Creation Request
    const courseCreated = await Course.create({
      title,
      description,
      difficulty,
      duration,
      user: req.user,
    });
    // ? push the course
    userFound.courseCreated.push(courseCreated._id);
    // ? Re save the user to be updated with the data
    await userFound.save();
    // ! Send the response
    res.json(courseCreated);
  }),
  // ! Getting all courses request
  lists: asyncHandler(async (req, res) => {
    const foundAllCourses = await Course.find().populate("sections").populate({
      path: "user",
      model: "User",
      select: "username email",
    });
    res.json(foundAllCourses);
  }),
  // ! Getting a single course
  getCourseById: asyncHandler(async (req, res) => {
    const findSingleCourse = await Course.findById(req.params.courseId)
      .populate("sections")
      .populate({
        path: "user",
        model: "User",
        select: "username email",
      });
    res.json(findSingleCourse);
  }),
  // ! Updating a course
  update: asyncHandler(async (req, res) => {
    const courseFoundAndUpdated = await Course.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      { new: true }
    );
    if (courseFoundAndUpdated) {
      res.json(courseFoundAndUpdated);
    } else {
      res.status(404);
      throw new Error("Course Not Found");
    }
  }),
  // ! Deleting  a course
  delete: asyncHandler(async (req, res) => {
    // ! Find  course
    const findCourse = await Course.findById(req.params.courseId);
    // ! Prevent deleting if course has students taking it
    if (findCourse && findCourse.students.length > 0) {
      res.status(400);
      res.json({
        message: "Courses with students , can't be deleted",
      });
      return; // ? out of the function
    }
    // ! Proceed To Delete
    const courseFoundAndDeleted = await Course.findByIdAndDelete(
      req.params.courseId
    );
    if (courseFoundAndDeleted) {
      // * Remove from the user's course created
      await User.updateMany(
        { courseCreated: req.params.courseId },
        {
          $pull: {
            courseCreated: req.params.courseId,
          },
        }
      );
      // ! Send Response
      res.json({
        message: "This Course Deleted Successfully !!✅✅",
        data: courseFoundAndDeleted,
      });
    } else {
      res.status(404);
      throw new Error("Course Not Found");
    }
  }),
};
module.exports = courseCtrl;
