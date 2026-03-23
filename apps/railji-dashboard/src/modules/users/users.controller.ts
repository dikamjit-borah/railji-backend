import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { paginate } from '@railji/shared';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const { page: normalizedPage, limit: normalizedLimit } = paginate(page, limit);
    const result = await this.usersService.findAll(normalizedPage, normalizedLimit);
    return {
      message: 'Users retrieved successfully',
      data: result
    };
  }

  @Patch(':userId/toggle')
  @HttpCode(HttpStatus.OK)
  async toggle(@Param('userId') userId: string) {
    const result = await this.usersService.toggle(userId);
    return {
      message: 'User status updated successfully',
      data: result,
    };
  }
}