import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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

  async fetchAllDepartments(query?: any): Promise<Department[]> {
    try {
      const cacheKey = `${this.DEPARTMENTS_CACHE_KEY}`;

      // Check cache first
      const cached = this.cacheService.get<Department[]>(cacheKey);

      if (cached) {
        this.logger.debug('Returning cached departments data');
        return cached;
      }

      // Fetch from database
      const departments = await this.departmentModel.find(query || {}).exec();

      // Cache the result
      this.cacheService.set(cacheKey, departments, this.CACHE_TTL);
      this.logger.debug(
        `Cached departments data with ${departments.length} departments`,
      );

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
}
