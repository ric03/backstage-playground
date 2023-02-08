import { Entity, getCompoundEntityRef } from '@backstage/catalog-model';
import { Logger } from 'winston';
import {
  HEALTHCHECK_URL_ANNOTATION,
  HealthCheckResponse,
} from '@internal/plugin-health-check-common';

export async function runHealthChecks(
  entities: Entity[],
  logger: Logger,
): Promise<HealthCheckResponse> {
  logger.info('Executing health checks...');

  const healthChecks = entities.map(async entity => {
    const entityRef = getCompoundEntityRef(entity);
    const healthEndpoint = getHealthEndpoint(entity);
    const { isHealthy, error } = await checkHealth(healthEndpoint, logger);

    return { entityRef, isHealthy, error };
  });

  return { items: await Promise.all(healthChecks) };
}

function getHealthEndpoint(entity: Entity): string | undefined {
  return entity.metadata.annotations?.[HEALTHCHECK_URL_ANNOTATION];
}

interface CheckHealthResult {
  isHealthy: boolean;
  error?: string;
}

/**
 * Check the status of the given healthEndpoint.
 *
 * The endpoint is considered healthy, if the response status is in the range 200 - 299, otherwise unhealthy.
 */
export async function checkHealth(
  healthEndpoint: string | undefined,
  logger: Logger,
): Promise<CheckHealthResult> {
  const healthy = () => ({ isHealthy: true });
  const unhealthy = (error: string) => ({ isHealthy: false, error });

  if (!healthEndpoint)
    return unhealthy(`Invalid healthEndpoint (${healthEndpoint})`);

  try {
    const response = await fetch(healthEndpoint);
    if (!response.ok) return unhealthy(await response.text());
    return healthy();
  } catch (error) {
    const message = `An error occurred while checking the health of '${healthEndpoint}'`;
    logger.error(message, error);

    return unhealthy(`${message} - Error: ${(error as Error).message}`);
  }
}
