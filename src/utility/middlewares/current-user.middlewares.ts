import { Injectable, NestMiddleware } from '@nestjs/common';
import { isArray } from 'class-validator';
import { verify, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/entities/user.entity';

declare global{
  namespace Express{
    interface Request{
      currentUser?:UserEntity;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(private readonly usersService: UsersService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!headerValue || !headerValue.startsWith('Bearer ')) {
        req.currentUser = undefined;
        next();
    } else {
      const token = headerValue.split(' ')[1];
      try {
        if (!process.env.ACCESS_TOKEN_SECRET_KEY) {
          throw new Error('ACCESS_TOKEN_SECRET_KEY is not defined');
        }
        const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET_KEY) as JwtPayload;
        const currentUser = await this.usersService.findOne(+decoded.id);
        req.currentUser=currentUser || null;
      } catch (error) {
        console.error('Token verification failed:', error);
        req.currentUser=undefined;
      }
      next();
    }
  }
}
