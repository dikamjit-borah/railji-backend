import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const department =
      await this.departmentsService.create(createDepartmentDto);
    return {
      message: 'Department created successfully',
      data: department,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query?: any) {
    const departments = await this.departmentsService.findAll(query);
    return {
      message: 'Departments retrieved successfully',
      data: departments,
    };
  }

  @Get(':departmentId')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('departmentId') departmentId: string) {
    const department = await this.departmentsService.findById(departmentId);
    return {
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  @Put(':departmentId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('departmentId') departmentId: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const department = await this.departmentsService.update(
      departmentId,
      updateDepartmentDto,
    );
    return {
      message: 'Department updated successfully',
      data: department,
    };
  }
}
