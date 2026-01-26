import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
    const department = await this.departmentsService.create(
      createDepartmentDto,
    );
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    const department = await this.departmentsService.findById(id);
    return {
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const department = await this.departmentsService.update(
      id,
      updateDepartmentDto,
    );
    return {
      message: 'Department updated successfully',
      data: department,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const result = await this.departmentsService.delete(id);
    return {
      message: result.message,
      data: null,
    };
  }
}
