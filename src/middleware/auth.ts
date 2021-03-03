import { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import asynchandler from 'express-async-handler';
import { ErrorResponse } from '../utils/ErrorResponse';
import User from '../models/User';

// Authorization via jsonwebtoken from cookie
// Any routes that use protect will have acess to user and its properties

export const protect = asynchandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }
    //// Set token from cookie
    // else if (req.cookies.token) {
    //   token = req.cookies.token
    // }

    // Check if token exists
    if (!token) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }
    try {
      // Verify token
      const secret = process.env.JWT_SECRET as jsonwebtoken.Secret;
      const decoded: any = jsonwebtoken.verify(token, secret);
      // decoded will be in this format {id: string, iat: number, exp: number}

      res.locals.user = await User.findById(decoded.id);

      next();
    } catch (err) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }
  }
);

// Grant access to specific roles - NOTE: ROLE NAMES ARE CASE SENSITIVE!
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user.role;
    if (!roles.includes(user)) {
      return next(
        new ErrorResponse(
          `User with role of ${user} is unauthorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
// TODO - MAKE IT GENERIC
export const findByIdExists = asynchandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let checkUser = await User.findById(req.params.id);
    if (!checkUser) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    next();
  }
);
