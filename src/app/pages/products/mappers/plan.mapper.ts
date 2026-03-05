/**
 * Plan Mapper Service
 * Handles serialization (Entity → DTO) and deserialization (DTO → Entity)
 * between API responses and internal Plan entities
 */

import { Injectable } from '@angular/core';
import { Plan } from '../entities';
import { PlanApiDto } from '../entities/plan-api.dto';

@Injectable({
  providedIn: 'root',
})
export class PlanMapper {
  /**
   * DESERIALIZATION: Convert API DTO to Plan Entity
   * Use this when receiving data FROM the backend API
   *
   * @param dto - Plan data from API (snake_case)
   * @returns Plan - Internal entity (camelCase)
   */
  fromDto(dto: PlanApiDto): Plan {
    return {
      id: dto.id,
      name: dto.plan_name,
      description: dto.plan_description,
      price: dto.price_amount,
      billingCycle: this.mapBillingCycle(dto.billing_cycle),
      features: dto.feature_list || [],
      isPopular: dto.is_popular || false,
      isActive: dto.is_active !== undefined ? dto.is_active : true,
    };
  }

  /**
   * DESERIALIZATION (Batch): Convert array of API DTOs to Plan Entities
   *
   * @param dtos - Array of plan DTOs from API
   * @returns Plan[] - Array of internal entities
   */
  fromDtoArray(dtos: PlanApiDto[]): Plan[] {
    return dtos.map((dto) => this.fromDto(dto));
  }

  /**
   * Map API billing cycle to internal format
   */
  private mapBillingCycle(cycle: string): 'monthly' | 'yearly' | 'one-time' {
    const normalized = cycle?.toLowerCase();

    if (normalized === 'yearly' || normalized === 'annual') return 'yearly';
    if (normalized === 'onetime' || normalized === 'one-time' || normalized === 'one_time') return 'one-time';

    return 'monthly'; // Default
  }

  /**
   * Validate that a DTO has all required fields
   *
   * @param dto - Plan DTO to validate
   * @returns boolean - True if valid
   */
  isValidDto(dto: any): dto is PlanApiDto {
    return (
      dto &&
      typeof dto.id === 'number' &&
      typeof dto.plan_name === 'string' &&
      typeof dto.price_amount === 'number'
    );
  }
}
