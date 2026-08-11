import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/enums';
import { ApiError } from '../utils/ApiError';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Forbidden: Role '${req.user.role}' does not have permission to perform this action`
      );
    }

    next();
  };
};
