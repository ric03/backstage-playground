/**
 * Common functionalities for the router responses
 *
 * @fileOverview
 */
import { CompoundEntityRef } from '@backstage/catalog-model';
import { DateTime } from 'luxon';

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

/**
 * Raw object that is transferred from the server
 */
interface GetAllResponseEntityHistoryRaw {
  url: string;
  isHealthy: boolean;
  errorMessage?: string;
  // timestamp: transferred as a raw string with ISO-Format
  timestamp: string;
}

/**
 * Raw object that is transferred from the server
 */
interface GetAllResponseEntityInfoRaw {
  entityRef: CompoundEntityRef;
  status: { isHealthy: boolean };
  history: GetAllResponseEntityHistoryRaw[];
}

/**
 * Raw object that is transferred from the server
 */
interface GetAllResponseRaw {
  entities: GetAllResponseEntityInfoRaw[];
}

/**
 * Unmarshall the server response.
 *
 * The {@link DateTime} is marshalled into a ISO-string,
 * which means we have to convert it back into a valid DateTime object.
 *
 * @param raw GetAllResponseRaw
 */
export function unmarshallGetAllResponse(
  raw: GetAllResponseRaw,
): GetAllResponse {
  return {
    entities: raw.entities.map(it => ({
      ...it,
      history: it.history.map(hit => ({
        ...hit,
        timestamp: DateTime.fromISO(hit.timestamp as string),
      })),
    })),
  };
}
