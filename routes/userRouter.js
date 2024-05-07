const express = require("express");
const userCtrl = require("../controllers/userController");
const userRouter = express.Router();
const isAuthenticated = require("../middlewares/isAuth");
// ! register router
userRouter.post("/api/v1/users/register", userCtrl.register);
// ! login router
userRouter.post("/api/v1/users/login", userCtrl.login);
// ! find all users router
userRouter.get("/api/v1/users/lists", userCtrl.lists);
// ! profile router
userRouter.get("/api/v1/users/profile", isAuthenticated, userCtrl.profile);

module.exports = userRouter;
