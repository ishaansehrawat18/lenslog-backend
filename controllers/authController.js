import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Please provide name, username, email, and password" });
    }

    // 2. Check if a user with this email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or username already in use" });
    }

    // 3. Hash the password before saving (never store plain text passwords)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // 5. Generate a JWT for immediate login after registration
    const token = generateToken(user._id);

    // 6. Respond — never send back the password field
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      token,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Login an existing user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 2. Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare provided password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Generate a JWT
    const token = generateToken(user._id);

    // 5. Respond — never send back the password field
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires valid JWT)
export const getMe = async (req, res) => {
  try {
    // req.user was attached by the authMiddleware after verifying the token
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Get current user error:", error.message);
    return res.status(500).json({ message: "Server error fetching current user" });
  }
};