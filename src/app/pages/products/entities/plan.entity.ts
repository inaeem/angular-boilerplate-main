/**
 * Application Plan Interface
 * Represents a subscription or service plan that can be selected for an application
 */
export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

/**
 * Plan Category for grouping plans
 */
export interface PlanCategory {
  id: string;
  name: string;
  description?: string;
}
