const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const jwt = require("jsonwebtoken");

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
  //!Lists
  lists: asyncHandler(async (req, res) => {
    const usersFound = await User.find();
    res.json(usersFound);
  }),
};
module.exports = userCtrl;
