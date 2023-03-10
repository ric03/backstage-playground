import {
  CATALOG_FILTER_EXISTS,
  CatalogClient,
  EntityFilterQuery,
  GetEntitiesResponse,
} from '@backstage/catalog-client';

import { Logger } from 'winston';
import { Entity } from '@backstage/catalog-model';
import { HEALTHCHECK_URL_ANNOTATION } from '@internal/plugin-health-check-common';

/**
 * Load every entity, that is annotated with `health-check/url`
 *
 * @param catalogClient
 * @param logger
 * @return List of entities
 */
export async function loadHealthCheckEntities(
  catalogClient: CatalogClient,
  logger: Logger,
): Promise<Entity[]> {
  const filter: EntityFilterQuery = {
    // kind: 'Component',
    // 'spec.type': 'api',
    [`metadata.annotations.${HEALTHCHECK_URL_ANNOTATION}`]:
      CATALOG_FILTER_EXISTS,
  };

  const response: GetEntitiesResponse = await catalogClient.getEntities({
    filter: [filter],
  });

  logger.debug(
    `Found ${response.items.length} entities annotated with ${HEALTHCHECK_URL_ANNOTATION}`,
  );

  return response.items;
}

/**
 * Extract the healthCheck endpoint from the entity.
 *
 * @param entity
 * @return the url, or if undefined an empty string
 */
export function getHealthEndpoint(entity: Entity): string {
  return entity.metadata.annotations?.[HEALTHCHECK_URL_ANNOTATION] ?? '';
}
