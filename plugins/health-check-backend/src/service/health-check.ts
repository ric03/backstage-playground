import {Entity, getCompoundEntityRef} from '@backstage/catalog-model';
import {Logger} from 'winston';
import {HealthCheckResponse} from '@internal/plugin-health-check-common';
import {getHealthEndpoint} from './entity-loader';
import {DateTime} from 'luxon';

/**
 * The result of the fetch call
 * @internal
 */
interface HealthCheckResult {
  isHealthy: boolean;
  errorMessage?: string;
}

export async function executeHealthChecks(
  entities: Entity[],
  logger: Logger,
): Promise<HealthCheckResponse> {
  logger.info('Executing health checks...');

  const healthChecks = entities.map(async entity => {
    const entityRef = getCompoundEntityRef(entity);
    const healthEndpoint = getHealthEndpoint(entity);

    const healthCheckResult = await checkHealth(healthEndpoint, logger);

    return {
      entityRef: entityRef,
      url: healthEndpoint,
      isHealthy: healthCheckResult.isHealthy,
      errorMessage: healthCheckResult.errorMessage,
      timestamp: DateTime.now(),
    };
  });

  return { items: await Promise.all(healthChecks) };
}

/**
 * Check the status of the given healthEndpoint.
 *
 * @param healthEndpoint an url that will be fetched
 * @param logger
 * @param timeoutSeconds defines the timeout for the fetch call, defaults to 5
 * @return healthy, if the response status is in the range 200 - 299, otherwise unhealthy.
 */
export async function checkHealth(
  healthEndpoint: string | undefined,
  logger: Logger,
  timeoutSeconds: number = 5,
): Promise<HealthCheckResult> {
  const healthy = (): HealthCheckResult => ({ isHealthy: true });
  const unhealthy = (errorMessage: string) => ({
    isHealthy: false,
    errorMessage,
  });

  if (!healthEndpoint)
    return unhealthy(`Invalid healthEndpoint (${healthEndpoint})`);

  try {
    const response = await fetchWithTimeout(healthEndpoint, timeoutSeconds);
    return response.ok ? healthy() : unhealthy(await response.text());
  } catch (error) {
    const errorMessage = createErrorMessage(
      error as Error,
      healthEndpoint,
      timeoutSeconds,
    );
    logger.info(errorMessage);
    return unhealthy(errorMessage);
  }
}

function createErrorMessage(
  error: Error,
  healthEndpoint: string,
  timeoutSeconds: number,
) {
  if (error.name === 'AbortError') {
    return `Request for ${healthEndpoint} timed out because it took longer than ${timeoutSeconds} seconds to resolve`;
  } else if (error.message) {
    return `Request for ${healthEndpoint} failed - ${error.message}`;
  }
  return `Request for ${healthEndpoint} failed`;
}

/**
 * Fetch an url with a timeout.
 *
 * The default timeout of nodejs is too long (120 secs).
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
