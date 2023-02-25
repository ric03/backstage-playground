/**
 * Common functionalities for the health-check plugin.
 *
 * @packageDocumentation
 */
import { CompoundEntityRef } from '@backstage/catalog-model';
import { DateTime } from 'luxon';

export const HEALTHCHECK_URL_ANNOTATION = 'health-check/url';

/**
 * Database entity
 */
export interface HealthCheckEntity {
  /**
   * unique id of the database entity, automatically generated
   */
  id?: number;
  entityRef: CompoundEntityRef;
  url: string;
  isHealthy: boolean;
  errorMessage?: string;
  timestamp: DateTime;
}

export interface GetAllResponseEntityHistory {
  url: string;
  isHealthy: boolean;
  errorMessage?: string;
  timestamp: DateTime;
}

export interface GetAllResponseEntityInfo {
  entityRef: CompoundEntityRef;
  status: { isHealthy: boolean };
  history: GetAllResponseEntityHistory[];
}

export interface GetAllResponse {
  entities: GetAllResponseEntityInfo[];
}
