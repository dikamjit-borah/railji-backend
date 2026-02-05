import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from './schemas/department.schema';
import { CacheService } from '@railji/shared';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);
  private readonly DEPARTMENTS_CACHE_KEY = 'all_departments';
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    private readonly cacheService: CacheService,
  ) {}

  async fetchAllDepartments(query?: any): Promise<{
    departments: Department[];
    metadata: { general: Department | null };
  }> {
    try {
      const cacheKey = `${this.DEPARTMENTS_CACHE_KEY}`;

      // Check cache first
      const cached = this.cacheService.get<{
        departments: Department[];
        metadata: { general: Department | null };
      }>(cacheKey);

      if (cached) {
        this.logger.debug('Returning cached departments data');
        return cached;
      }

      // Fetch from database
      const departments = await this.departmentModel.find(query || {}).exec();
      const general =
        departments.find((dept) => dept.departmentId === 'GENERAL') || null;
      const filtered = departments.filter(
        (dept) => dept.departmentId !== 'GENERAL',
      );

      const result = { departments: filtered, metadata: { general } };

      // Cache the result
      this.cacheService.set(cacheKey, result, this.CACHE_TTL);
      this.logger.debug(
        `Cached departments data with ${filtered.length} departments`,
      );

      this.logger.log(`Found ${filtered.length} departments`);
      return result;
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
}
