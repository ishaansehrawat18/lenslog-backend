import jwt from "jsonwebtoken";

// Generates a signed JWT containing the user's ID.
// Used right after successful register/login.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;