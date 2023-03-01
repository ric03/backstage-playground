/**
 * Common functionalities for the router responses
 *
 * @fileOverview
 */
import { CompoundEntityRef } from '@backstage/catalog-model';

export type milliseconds = number;

export interface ResponseTime {
  timestamp: milliseconds;
  responseTime: milliseconds;
}

export enum Status {
  UP,
  DEGRADED,
  DOWN,
}

export interface EntityInfo {
  entityRef: CompoundEntityRef;
  url: string;
  status: Status;
  history: ResponseTime[];
}

export interface GetAllResponse {
  entities: EntityInfo[];
}
