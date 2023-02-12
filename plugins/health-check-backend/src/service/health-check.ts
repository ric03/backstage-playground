import { Entity, getCompoundEntityRef } from '@backstage/catalog-model';
import { Logger } from 'winston';
import { HealthCheckResponse } from '@internal/plugin-health-check-common';
import { getHealthEndpoint } from './entities-loader';

export async function executeHealthChecks(
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

interface CheckHealthResult {
  isHealthy: boolean;
  error?: string;
}

/**
 * https://dmitripavlutin.com/timeout-fetch-request/
 */
async function fetchWithTimeout(
  healthEndpoint: string,
  timeoutSeconds: number,
) {
  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    timeoutSeconds * 1000,
  );
  const response = await fetch(healthEndpoint, {
    signal: abortController.signal,
  });
  clearTimeout(timeoutId);
  return response;
}

/**
 * Check the status of the given healthEndpoint.
 *
 * The endpoint is considered healthy, if the response status is in the range 200 - 299, otherwise unhealthy.
 */
export async function checkHealth(
  healthEndpoint: string | undefined,
  logger: Logger,
  timeoutSeconds: number = 5,
): Promise<CheckHealthResult> {
  const healthy = () => ({ isHealthy: true });
  const unhealthy = (error: string) => ({ isHealthy: false, error });

  if (!healthEndpoint)
    return unhealthy(`Invalid healthEndpoint (${healthEndpoint})`);

  try {
    const response = await fetchWithTimeout(healthEndpoint, timeoutSeconds);
    if (!response.ok) return unhealthy(await response.text());
    return healthy();
  } catch (error) {
    let message;
    if ((error as Error).name === 'AbortError') {
      message = `Request for ${healthEndpoint} timed out because it took longer than ${timeoutSeconds} seconds to resolve`;
    } else {
      message = `An error occurred while checking the health of '${healthEndpoint}'`;
    }
    logger.error(message, error);

    return unhealthy(`${message} - Error: ${(error as Error).message}`);
  }
}
