const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userScheme = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "instructor", "student"],
      default: "student",
    },
    progress: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        sections: [
          {
            sectionId: {
              type: Schema.Types.ObjectId,
              ref: "CourseSection",
              required: true,
            },
            status: {
              type: String,
              enum: ["Not Started", "In Progress", "Completed"],
              default: "Not Started",
            },
          },
        ],
      },
    ],
    courseCreated: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    courseApplied: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    lastLogin: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userScheme);
