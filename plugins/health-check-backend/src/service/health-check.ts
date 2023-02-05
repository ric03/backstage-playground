import { CatalogClient } from '@backstage/catalog-client';
import { loadHealthCheckEntities } from './entities-loader';
import { Entity } from '@backstage/catalog-model';
import { Logger } from 'winston';

interface HealthCheckResponse {
  name: string;
  isResponseOk: boolean;
}

function getHealthEndpoint(entity: Entity) {
  return entity.metadata.annotations?.['healthCheck/url'];
}

export async function runHealthChecks(
  logger: Logger,
  catalogClient: CatalogClient,
): Promise<HealthCheckResponse[]> {
  const healthCheckEntities = await loadHealthCheckEntities(catalogClient);

  logger.info(
    `Found ${healthCheckEntities.items.length} entities annotated with 'healthCheck/url'`,
    healthCheckEntities, // todo remove this verbose object
  );

  const healthChecks = healthCheckEntities.items.map(async entity => {
    const healthEndpoint = getHealthEndpoint(entity);
    return {
      name: entity.metadata.name,
      isResponseOk: await checkHealth(healthEndpoint),
    };
  });
  return await Promise.all(healthChecks);
}

/**
 * Check the healthEndpoint
 * @param healthEndpoint
 * @return true if response is ok (200-299) otherwise false
 */
export async function checkHealth(
  healthEndpoint: string | undefined,
): Promise<boolean> {
  if (!healthEndpoint) {
    return false;
  }

  const response = await fetch(healthEndpoint);
  return response.ok;
}
