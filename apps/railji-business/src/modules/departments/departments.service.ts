import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from './schemas/department.schema';
import { Material } from './schemas/material.schema';
import { CacheService } from '@railji/shared';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);
  private readonly DEPARTMENTS_CACHE_KEY = 'all_departments';
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<Material>,
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

  async fetchMaterialsByDepartment(departmentId: string, query?: any): Promise<Material[]> {
    try {
      const cacheKey = `materials_${departmentId}`;

      // Check cache first
      const cached = this.cacheService.get<Material[]>(cacheKey);

      if (cached) {
        this.logger.debug(`Returning cached materials data for department ${departmentId}`);
        return cached;
      }

      // Build filter query
      const filter = { departmentId, isActive: true, ...query };

      // Fetch from database
      const materials = await this.materialModel.find(filter).exec();

      // Cache the result
      this.cacheService.set(cacheKey, materials, this.CACHE_TTL);
      this.logger.debug(
        `Cached materials data for department ${departmentId} with ${materials.length} materials`,
      );

      this.logger.log(`Found ${materials.length} materials for department ${departmentId}`);
      return materials;
    } catch (error) {
      this.logger.error(
        `Error fetching materials for department ${departmentId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch materials');
    }
  }
}
