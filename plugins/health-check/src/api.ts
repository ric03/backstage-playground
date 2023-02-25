import {
  GetAllResponse,
  unmarshallGetAllResponse,
} from '@internal/plugin-health-check-common';
import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';

export interface HealthCheckApi {
  getAllHealthChecks(): Promise<GetAllResponse>;
}

export const healthCheckApiRef = createApiRef<HealthCheckApi>({
  id: 'plugin.health-check-api.service',
});

export class HealthCheckBackendClient implements HealthCheckApi {
  private baseUrl?: string;

  constructor(private discoveryApi: DiscoveryApi) {}

  async getAllHealthChecks(): Promise<GetAllResponse> {
    const url = `${await this.loadBaseUrl()}/all`;
    const response = await fetch(url);
    const rawJson = await response.json();
    return unmarshallGetAllResponse(rawJson);
  }

  private async loadBaseUrl() {
    if (this.baseUrl) return this.baseUrl;
    return await this.discoveryApi.getBaseUrl('health-check');
  }
}
