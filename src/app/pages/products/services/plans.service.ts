import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, timeout, catchError, throwError, map } from 'rxjs';
import { environment } from '@env/environment';
import { Plan, PlanApiDto } from '../entities';
import { PlanMapper } from '../mappers';

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  private readonly useMockData = environment.useMockData;
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly apiTimeout = environment.apiTimeout;

  /**
   * Mock data in API DTO format (snake_case)
   * Mock data ALWAYS uses DTO format to simulate real API behavior
   */
  private mockPlanDtos: PlanApiDto[] = [
    {
      id: 1,
      plan_name: 'Starter',
      plan_description: 'Basic plan',
      price_amount: 0,
      billing_cycle: 'monthly',
      feature_list: [],
      is_popular: false,
      is_active: true,
    },
    {
      id: 2,
      plan_name: 'Professional',
      plan_description: 'Professional plan',
      price_amount: 49,
      billing_cycle: 'monthly',
      feature_list: [],
      is_popular: true,
      is_active: true,
    },
    {
      id: 3,
      plan_name: 'Business',
      plan_description: 'Business plan',
      price_amount: 149,
      billing_cycle: 'monthly',
      feature_list: [],
      is_popular: false,
      is_active: true,
    },
    {
      id: 4,
      plan_name: 'Enterprise',
      plan_description: 'Enterprise plan',
      price_amount: 499,
      billing_cycle: 'monthly',
      feature_list: [],
      is_popular: false,
      is_active: true,
    },
    {
      id: 5,
      plan_name: 'Premium',
      plan_description: 'Premium plan',
      price_amount: 299,
      billing_cycle: 'monthly',
      feature_list: [],
      is_popular: false,
      is_active: true,
    },
    {
      id: 6,
      plan_name: 'Trial',
      plan_description: 'Trial plan',
      price_amount: 0,
      billing_cycle: 'monthly',
      feature_list: [],
      is_popular: false,
      is_active: true,
    },
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly planMapper: PlanMapper,
  ) {}

  /**
   * Helper method to build full API URL
   */
  private buildUrl(endpoint: string): string {
    return `${this.apiBaseUrl}${endpoint}`;
  }

  /**
   * Helper method to get random delay time for mock data
   */
  private getRandomDelay(): number {
    const min = environment.mockDataDelay.min;
    const max = environment.mockDataDelay.max;
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Get all active plans (supports both mock and API modes)
   * Real API ALWAYS returns DTOs which are mapped to Plan entities
   */
  getPlans(): Observable<Plan[]> {
    if (this.useMockData) {
      return this.getMockPlans();
    }

    // Real API endpoint (adjust endpoint as needed)
    const url = this.buildUrl('/api/plans');
    return this.http.get<PlanApiDto[]>(url).pipe(
      map((dtos) => this.planMapper.fromDtoArray(dtos)),
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error('Error fetching plans from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of getPlans
   * Always returns DTOs and maps them to simulate real API behavior
   */
  private getMockPlans(): Observable<Plan[]> {
    // Only return active plans
    const activeDtos = this.mockPlanDtos.filter(dto => dto.is_active);
    return of(activeDtos).pipe(
      map((dtos) => this.planMapper.fromDtoArray(dtos)),
      delay(this.getRandomDelay())
    );
  }

  /**
   * Get a single plan by ID (supports both mock and API modes)
   */
  getPlanById(id: number): Observable<Plan | undefined> {
    if (this.useMockData) {
      return this.getMockPlanById(id);
    }

    const url = this.buildUrl(`/api/plans/${id}`);
    return this.http.get<PlanApiDto>(url).pipe(
      map((dto) => this.planMapper.fromDto(dto)),
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error(`Error fetching plan ${id} from API:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of getPlanById
   */
  private getMockPlanById(id: number): Observable<Plan | undefined> {
    const dto = this.mockPlanDtos.find((p) => p.id === id);
    if (!dto) {
      return of(undefined).pipe(delay(this.getRandomDelay()));
    }
    return of(dto).pipe(
      map((dto) => this.planMapper.fromDto(dto)),
      delay(this.getRandomDelay())
    );
  }
}
