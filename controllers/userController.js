const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userCtrl = {
  // ! Register Request
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    //validation
    if (!username || !email || !password) {
      throw new Error("Please all fields are required");
    }
    //check if user is already existed
    const userExist = await User.findOne({ email });
    if (userExist) {
      throw new Error("User is already existed");
    }
    // hashing and encrypting user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    /* # comment
    TODO: Create the user
    */
    const userCreated = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    /* # comment
    TODO: Sending the response
    */
    res.json({
      id: userCreated._id,
      username: userCreated.username,
      password: userCreated.password,
      role: userCreated.role,
      email: userCreated.email,
    });
  }),

  // ! Login Request
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // TODO: Check if the user email existed
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    // TODO: Check if the password valid
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      // NOT Found Code
      res.status(410);
      throw new Error("Invalid email or password");
    }
    // TODO: Generate the token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    // TODO: send the response
    res.json({
      message: "Logged In Successfully ❇️✅❇️✅❇️",
      token,
      id: user._id,
      email: user.email,
    });
  }),
  // ! Profile
  profile: asyncHandler(async (req, res) => {
    res.json({
      message: "Welcome To Tour Profile",
    });
  }),
  //! Find all users
  lists: asyncHandler(async (req, res) => {
    const allUsersFound = await User.find({});
    res.json(allUsersFound);
  }),
  //! Positioning of students based on course
  studentPosition: asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    // ! Validate the course by id
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course Id " });
    }
    // ! Find All Users
    const allUsersFound = await User.find({}).populate({
      path: "progress",
      populate: {
        path: "courseId",
        model: "Course",
        populate: { path: "sections" },
      },
    });
    let userProgressData = allUsersFound
      .map((singleUser) => {
        const courseProgress = singleUser.progress.find(
          (courseProg) =>
            courseProg.courseId &&
            courseProg.courseId._id.toString() === courseId
        );
        if (!courseProgress) {
          return null;
        }
        // ! Get Total Section
        const totalSections = courseProgress.courseId.sections.length;

        // ! Calculate the sections completed
        const sectionsCompleted = courseProgress.sections.filter(
          (section) => section.status === "Completed"
        ).length;
        // ! Calculate the progress percentage
        const progressPercentage =
          totalSections > 0
            ? parseFloat((sectionsCompleted / totalSections) * 100).toFixed(1)
            : 0;
        return {
          id: singleUser._id,
          username: singleUser.username,
          role: singleUser.role,
          email: singleUser.email,
          dateJoined: singleUser.createdAt,
          position: null,
          progressPercentage: progressPercentage,
          totalSections: totalSections,
          sectionsCompleted: sectionsCompleted,
        };
      })
      .filter((item) => item !== null);
    // ! Sort users based on sections completed and assign positions
    // ! Sort users based Completed Sections
    userProgressData.sort((a, b) => b.sectionsCompleted - a.sectionsCompleted);
    // ! Due To Sorting We need to assign Positions
    let lastRank = 0;
    let lastSectionsCompleted = -1;
    userProgressData.forEach((user) => {
      if (user.sectionsCompleted !== lastSectionsCompleted) {
        lastRank++;
        lastSectionsCompleted = user.sectionsCompleted;
        user.position = `${lastRank}${
          ["st", "nd", "rd"][(((lastRank + 90) % 100) % 10) - 1] || "th"
        }`;
      }
    });
    // ! Sending Response to the User
    res.json({
      message: "Positions of students",
      userProgressData,
    });
  }),
};
module.exports = userCtrl;
