import { RequestHandler } from 'express';
import User from '../models/User';
import asyncHandler from 'express-async-handler';
import { ErrorResponse } from '../utils/errorResponse';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register: RequestHandler = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create token
  const token = user.getSignedJwtToken();
  res.status(200).json({ sucess: true, token });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login: RequestHandler = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  // Create token
  const token = user.getSignedJwtToken();
  res.status(200).json({ sucess: true, token });
});