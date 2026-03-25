import { Controller, Get, Query, HttpStatus, HttpCode, Param, UseGuards, Req } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Public } from '@libs';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query?: any, @Req() req?: any) {
    const supabaseId = req.user?.userId; // Will be undefined if no valid token
    const result = await this.departmentsService.fetchAllDepartments(query, supabaseId);
    return {
      message: 'Departments retrieved successfully',
      data: result,
    };
  }

  @Get(':departmentId/materials')
  @HttpCode(HttpStatus.OK)
  async getMaterialsByDepartment(
    @Param('departmentId') departmentId: string,
    @Query() query?: any,
  ) {
    const result = await this.departmentsService.fetchMaterialsByDepartment(
      departmentId,
      query,
    );
    return {
      message: 'Materials retrieved successfully',
      data: result,
    };
  }
}
