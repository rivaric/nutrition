import { DatabaseService } from '@app/database/database.service';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class MealOwnershipGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequestInterface>();

    const userId = request.user?.id;
    const mealId = +request.params.mealId;

    if (!userId || isNaN(mealId)) {
      throw new HttpException('Invalid user or meal ID', HttpStatus.FORBIDDEN);
    }

    const meal = await this.databaseService.meal.findFirst({
      where: { id: mealId, userId },
    });

    if (!meal) {
      throw new HttpException('You do not have access to this meal', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
