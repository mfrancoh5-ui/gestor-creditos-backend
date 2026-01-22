import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Si viene en header, úsalo; sino genera uno nuevo
    const requestId = req.headers['x-request-id'] as string || randomUUID();

    // Inyecta en request y response
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}
