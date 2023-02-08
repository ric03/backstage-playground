import { HealthCheckResponse } from '@internal/plugin-health-check-common';
import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';

export interface HealthCheckApi {
  runAllHealthChecks(): Promise<HealthCheckResponse>;
}

export const healthCheckApiRef = createApiRef<HealthCheckApi>({
  id: 'plugin.health-check-api.service',
});

export class HealthCheckBackendClient implements HealthCheckApi {
  constructor(private discoveryApi: DiscoveryApi) {}

  async runAllHealthChecks(): Promise<HealthCheckResponse> {
    const url = `${await this.discoveryApi.getBaseUrl('health-check')}/all`;
    const response = await fetch(url);
    return await response.json();
  }
}
