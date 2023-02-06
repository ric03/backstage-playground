import {
  CATALOG_FILTER_EXISTS,
  CatalogClient,
  EntityFilterQuery,
  GetEntitiesResponse,
} from '@backstage/catalog-client';
import { HEALTHCHECK_URL_ANNOTATION } from './entity-annotations';

export async function loadHealthCheckEntities(
  catalogClient: CatalogClient,
): Promise<GetEntitiesResponse> {
  const filter: EntityFilterQuery = {
    // kind: 'Component',
    // 'spec.type': 'api',
    [HEALTHCHECK_URL_ANNOTATION]: CATALOG_FILTER_EXISTS,
  };

  return await catalogClient.getEntities({
    filter: [filter],
  });
}
