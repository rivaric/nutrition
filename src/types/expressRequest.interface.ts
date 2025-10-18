import { Request } from 'express';
import { User } from 'generated/prisma';

export interface ExpressRequestInterface extends Request {
  user: Pick<User, 'id' | 'email'> | undefined;
}
