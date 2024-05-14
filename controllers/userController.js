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
  // ! Profile Public with progress
  publicProfile: asyncHandler(async (req, res) => {
    // ! Get user id from query ?
    const userId = req.query.userId;
    // ! Find All Users
    const foundUser = await User.findById(userId).populate({
      path: "progress",
      populate: [
        {
          path: "courseId",
          model: "Course",
          populate: { path: "sections", model: "CourseSection" },
        },
        {
          path: "sections.sectionId",
        },
      ],
    });
    if (!foundUser) {
      return res.status(404).json({ message: "User Not Found" });
    }
    // ! Get course id from params
    const courseIdParams = req.params.courseId;
    console.log(req.query);
    // ! Filter progress for specific course if course params is provided
    const courseProgress = courseIdParams
      ? foundUser.progress.find(
          (prog) => prog.courseId._id.toString() === courseIdParams.toString()
        )
      : null;
    // ! If Course founded with the progress then calculate the summary
    let progressSummary = null;
    if (courseProgress) {
      const totalSections = courseProgress.courseId.sections.length;
      console.log(totalSections);
      let completed = 0,
        onGoing = 0,
        notStarted = 0;
      courseProgress.sections.forEach((section) => {
        if (section.status === "Completed") {
          completed++;
        } else if (section.status === "In Progress") {
          onGoing++;
        } else {
          notStarted++;
        }
        // ? update the object result
        progressSummary = {
          courseId: courseProgress.courseId._id,
          courseTitle: courseProgress.courseId.title,
          totalSections: totalSections,
          completed: completed,
          onGoing: onGoing,
          notStarted: notStarted,
        };
        // ! Sending Response to the User
        res.json({
          message: "User Found Successfully For This Course",
          progressSummary,
        });
      });
    }
  }),
  // ! Profile Public with progress
  privateProfile: asyncHandler(async (req, res) => {
    // ! Get user id
    const userId = req.user;
    // ! Find All Users
    const foundUser = await User.findById(userId).populate({
      path: "progress",
      populate: [
        {
          path: "courseId",
          model: "Course",
          populate: { path: "sections", model: "CourseSection" },
        },
        {
          path: "sections.sectionId",
        },
      ],
    });
    if (!foundUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // ! Calculate the progress statistics for each course
    const courseProgress = foundUser.progress.map((courseProg) => {
      const totalSections = courseProg.courseId.sections.length;
      let completed = 0,
        onGoing = 0,
        notStarted = 0;
      courseProg.sections.forEach((section) => {
        if (section.status === "Completed") {
          completed++;
        } else if (section.status === "In Progress") {
          onGoing++;
        } else {
          notStarted++;
        }
        // ? update the object result
        return {
          courseId: courseProg.courseId._id,
          courseTitle: courseProg.courseId.title,

          totalSections: totalSections,
          completed: completed,
          onGoing: onGoing,
          notStarted: notStarted,
        };
      });
      // ! Prepare response
      const response = {
        totalCourses: foundUser.progress.length,
        courseProg,
      };
      res.json({
        message: "User Found Successfully",
        response,
      });
    });
  }),
  //! Find all users
  lists: asyncHandler(async (req, res) => {
    const allUsersFound = await User.find({});
    res.json(allUsersFound);
  }),
  //! Positioning of students
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
          (cp) => cp.courseId && cp.courseId._id.toString() === courseId
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
