/**
 * Common functionalities for the health-check plugin.
 *
 * @packageDocumentation
 */
import { CompoundEntityRef } from '@backstage/catalog-model';
import { DateTime } from 'luxon';

export interface HealthCheckItem {
  id?: number;
  entityRef: CompoundEntityRef;
  url: string;
  isHealthy: boolean;
  errorMessage?: string;
  timestamp: DateTime;
}

export interface HealthCheckResponse {
  items: HealthCheckItem[];
}

export const HEALTHCHECK_URL_ANNOTATION = 'health-check/url';
