import {
  CATALOG_FILTER_EXISTS,
  CatalogClient,
  EntityFilterQuery,
  GetEntitiesResponse,
} from '@backstage/catalog-client';

export async function loadHealthCheckEntities(
  catalogClient: CatalogClient,
): Promise<GetEntitiesResponse> {
  const filter: EntityFilterQuery = {
    // kind: 'Component',
    // 'spec.type': 'api',
    ['healthCheck/url']: CATALOG_FILTER_EXISTS,
  };

  return await catalogClient.getEntities({
    filter: [filter],
  });
}
