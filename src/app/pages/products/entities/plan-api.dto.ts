/**
 * Data Transfer Objects (DTOs) for Plan API
 * These represent the structure of data as it comes from/goes to the backend API
 */

/**
 * Plan DTO from API Response
 * This represents how the backend API returns plan data
 */
export interface PlanApiDto {
  id: number;
  plan_name: string; // Maps to: name
  plan_description: string; // Maps to: description
  price_amount: number; // Maps to: price
  billing_cycle: string; // Maps to: billingCycle
  feature_list: string[]; // Maps to: features
  is_popular: boolean; // Maps to: isPopular
  is_active: boolean; // Maps to: isActive

  // Additional API fields that might be present but not used
  created_at?: string;
  updated_at?: string;
}
