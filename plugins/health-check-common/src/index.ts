/**
 * Common functionalities for the health-check plugin.
 *
 * @packageDocumentation
 */
import { CompoundEntityRef } from '@backstage/catalog-model';

export interface HealthCheckItem {
  entityRef: CompoundEntityRef;
  isHealthy: boolean;
  error?: string;
}

export interface HealthCheckResponse {
  items: HealthCheckItem[];
}

export const HEALTHCHECK_URL_ANNOTATION = 'health-check/url';
