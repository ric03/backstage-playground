import {CATALOG_FILTER_EXISTS, CatalogClient, EntityFilterQuery, GetEntitiesResponse,} from '@backstage/catalog-client';
import {HEALTHCHECK_URL_ANNOTATION} from './entity-annotations';
import {Logger} from 'winston';
import {Entity} from '@backstage/catalog-model';

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
    [HEALTHCHECK_URL_ANNOTATION]: CATALOG_FILTER_EXISTS,
  };

  const response: GetEntitiesResponse = await catalogClient.getEntities({
    filter: [filter],
  });

  logger.info(
    `Found ${response.items.length} entities annotated with ${HEALTHCHECK_URL_ANNOTATION}`,
  );

  return response.items;
}
