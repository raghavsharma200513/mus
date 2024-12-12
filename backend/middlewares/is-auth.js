const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated!");
    error.statusCode = 401;
    throw error;
  }
  // console.log("authHeader", authHeader);

  const token = authHeader.split(" ")[1] || "";

  let decodedToken;
  // console.log("token", token);

  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated!");
    error.statusCode = 401;
    throw error;
  }

  // console.log("decodedToken", decodedToken);

  req.userId = decodedToken._id;
  // console.log("req.userId", req.userId);

  next();
};
