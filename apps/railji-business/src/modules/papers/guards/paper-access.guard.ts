import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PapersService } from '../papers.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';

@Injectable()
export class PaperAccessGuard implements CanActivate {
  constructor(
    private readonly papersService: PapersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const paperId = request.params.paperId;
    const userId = request.user?.userId;

    // Fetch paper by ID
    const paper = await this.papersService.findByPaperId(paperId);
    if (!paper) {
      throw new NotFoundException(`Paper with ID ${paperId} not found`);
    }

    // If paper is free, allow access immediately
    if (paper.isFree === true) {
      request.paper = paper;
      return true;
    }

    // Check if user is authenticated
    if (!userId) {
      throw new UnauthorizedException('Authentication required to access this paper');
    }

    // Check if user has access to this paper (either paper-level or department-level subscription)
    const hasAccess = await this.subscriptionsService.hasAccessToPaper(
      userId,
      paperId,
      paper.departmentId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Active subscription required to access this paper. You need access to either this specific paper or its department.',
      );
    }

    // Attach paper to request to avoid second DB fetch
    request.paper = paper;
    return true;
  }
}
