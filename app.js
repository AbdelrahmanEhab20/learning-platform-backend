require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRouter");
const courseRouter = require("./routes/courseRouter");
const courseSectionRouter = require("./routes/courseSectionRouter");
const progressRouter = require("./routes/progressRouter");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const app = express();
const PORT = process.env.PORT || 8000;

// ? connection to mongo db
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database Connected Successfully !!✅✅"))
  .catch((error) => console.log(error));

// ? middlewares
app.use(express.json());

// ! --------- Routes --------
app.use("/", userRouter);
app.use("/", courseRouter);
app.use("/", courseSectionRouter);
app.use("/", progressRouter);
//! Error handler middleware
app.use(errorHandler);
//!Not found route
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route Not Found." });
});
// ? Starting the server
app.listen(PORT, console.log(`Server is running now on PORT ${PORT}`));
