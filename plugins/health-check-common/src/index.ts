/**
 * Common functionalities for the health-check plugin.
 *
 * @packageDocumentation
 */
import { CompoundEntityRef } from '@backstage/catalog-model';
import { DateTime } from 'luxon';

export const HEALTHCHECK_URL_ANNOTATION = 'health-check/url';

export interface HealthCheckEntity {
  id?: number;
  entityRef: CompoundEntityRef;
  url: string;
  isHealthy: boolean;
  errorMessage?: string;
  timestamp: DateTime;
}

export interface GetAllResponseHistory {
  url: string;
  isHealthy: boolean;
  errorMessage?: string;
  timestamp: DateTime;
}

export interface GetAllResponseEntityInfo {
  entityRef: CompoundEntityRef;
  status: { isHealthy: boolean };
  history: GetAllResponseHistory[];
}

export interface GetAllResponse {
  entities: GetAllResponseEntityInfo[];
}
