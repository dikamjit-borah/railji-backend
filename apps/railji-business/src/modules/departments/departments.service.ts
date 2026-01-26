import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from './schemas/department.schema';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      const department = await this.departmentModel.create(
        createDepartmentDto,
      );
      this.logger.log(`Department created with ID: ${department._id}`);
      return department;
    } catch (error) {
      this.logger.error(
        `Error creating department: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to create department');
    }
  }

  async findAll(query?: any): Promise<Department[]> {
    try {
      const departments = await this.departmentModel.find(query || {}).exec();
      this.logger.log(`Found ${departments.length} departments`);
      return departments;
    } catch (error) {
      this.logger.error(
        `Error fetching departments: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch departments');
    }
  }

  async findById(id: string): Promise<Department> {
    try {
      const department = await this.departmentModel.findById(id).exec();
      if (!department) {
        this.logger.warn(`Department not found with ID: ${id}`);
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      return department;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Error finding department: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch department');
    }
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    try {
      const department = await this.departmentModel
        .findByIdAndUpdate(id, updateDepartmentDto, { new: true })
        .exec();
      if (!department) {
        this.logger.warn(`Department not found for update with ID: ${id}`);
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      this.logger.log(`Department updated with ID: ${id}`);
      return department;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Error updating department: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update department');
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const department = await this.departmentModel
        .findByIdAndDelete(id)
        .exec();
      if (!department) {
        this.logger.warn(`Department not found for deletion with ID: ${id}`);
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      this.logger.log(`Department deleted with ID: ${id}`);
      return { message: 'Department deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Error deleting department: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to delete department');
    }
  }
}
