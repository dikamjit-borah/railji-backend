import { Controller, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query?: any) {
    const result = await this.departmentsService.fetchAllDepartments(query);
    return {
      message: 'Departments retrieved successfully',
      data: result,
    };
  }
}
