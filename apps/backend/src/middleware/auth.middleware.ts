import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
    status: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    logger.error('JWT_SECRET not configured');
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as {
      sub: string;
      role: string;
      email?: string;
      status: string;
    };

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      status: payload.status,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) return next();

  try {
    const payload = jwt.verify(token, secret) as {
      sub: string; role: string; email?: string; status: string;
    };
    req.user = { id: payload.sub, role: payload.role, email: payload.email, status: payload.status };
  } catch {
    // Silently ignore invalid optional tokens
  }
  next();
}

// Audit log middleware
export async function auditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  req: Request,
  oldData?: unknown,
  newData?: unknown
): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId, action, entityType, entityId,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        req.ip,
        req.headers['user-agent']
      ]
    );
  } catch (err) {
    logger.error('Audit log failed', { error: (err as Error).message });
  }
}
