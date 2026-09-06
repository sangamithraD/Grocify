import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import t from '../utils/i18n';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: t(acceptLanguage, 'tokenMissing') });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_grocify_app_2026') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: t(acceptLanguage, 'tokenInvalid') });
  }
};
export default authMiddleware;
