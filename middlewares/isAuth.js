const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  // ! Get the token from the header
  const headerObj = req.headers;
  const token = headerObj?.authorization.split(" ")[1];
  // ! Verify the token
  const verifyToken = jwt.verify(
    token,
    process.env.JWT_SECRET,
    (error, decoded) => {
      if (error) {
        return false;
      } else {
        return decoded;
      }
    }
  );

  if (verifyToken) {
    // !! Save the user into the req obj
    req.user = verifyToken.id;
    // move to the controller of the profile
    next();
  } else {
    const error = new Error("Token expired , please login again");
    // move to the controller  with the error
    next(error);
  }
};
module.exports = isAuthenticated;
