import { CatalogClient } from '@backstage/catalog-client';
import { loadHealthCheckEntities } from './entities-loader';
import { Entity } from '@backstage/catalog-model';
import { Logger } from 'winston';
import { HEALTHCHECK_URL_ANNOTATION } from './entity-annotations';

interface HealthCheckResponse {
  name: string;
  isResponseOk: boolean;
}

function getHealthEndpoint(entity: Entity) {
  return entity.metadata.annotations?.[HEALTHCHECK_URL_ANNOTATION];
}

export async function runHealthChecks(
  logger: Logger,
  catalogClient: CatalogClient,
): Promise<HealthCheckResponse[]> {
  const healthCheckEntities = await loadHealthCheckEntities(catalogClient);

  logger.info(
    `Found ${healthCheckEntities.items.length} entities annotated with ${HEALTHCHECK_URL_ANNOTATION}`,
    healthCheckEntities.items, // todo remove this verbose object
  );

  const healthChecks = healthCheckEntities.items.map(async entity => {
    const healthEndpoint = getHealthEndpoint(entity);
    return {
      name: entity.metadata.name,
      isResponseOk: await checkHealth(healthEndpoint, logger),
    };
  });
  return await Promise.all(healthChecks);
}

/**
 * Check the status of the given healthEndpoint.
 *
 * The endpoint is considered healthy, if the response status is in the range 200 - 299.
 * Otherwise unhealthy, if the endpoint returns a status other than 2xx.
 *
 * @param healthEndpoint
 * @param logger
 * @return true only if response status is 2xx, otherwise false
 */
export async function checkHealth(
  healthEndpoint: string | undefined,
  logger: Logger,
): Promise<boolean> {
  if (!healthEndpoint) return false;

  try {
    const response = await fetch(healthEndpoint);
    return response.ok;
  } catch (e) {
    logger.warn(
      `An error occurred while checking the health of '${healthEndpoint}'`,
      e,
    );
    return false;
  }
}
