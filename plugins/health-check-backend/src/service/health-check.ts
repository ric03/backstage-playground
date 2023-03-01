import {
  CompoundEntityRef,
  Entity,
  getCompoundEntityRef,
} from '@backstage/catalog-model';
import { Logger } from 'winston';
import { getHealthEndpoint } from './entity-loader';
import { DateTime, Duration } from 'luxon';
import { fetchWithTimeout } from './util';
import { milliseconds } from '@internal/plugin-health-check-common';

/**
 * The result of the fetch call
 * @internal
 */
export interface HealthCheckResult {
  entityRef: CompoundEntityRef;
  url: string;
  status: Status;
  timestamp: DateTime;
}

interface Status {
  isHealthy: boolean;
  errorMessage?: string;
  responseTime: milliseconds;
}

/**
 * Create a healthy status with a responseTime
 */
function healthy(responseTime: milliseconds): Status {
  return { isHealthy: true, responseTime };
}

/**
 * Create an unhealthy status with an error message and an optional responseTime
 * @param errorMessage
 * @param responseTime optional
 */
function unhealthy(
  errorMessage: string,
  responseTime: milliseconds = 0,
): Status {
  return { isHealthy: false, errorMessage, responseTime };
}

export async function executeHealthChecks(
  entities: Entity[],
  requestTimeout: Duration,
  logger: Logger,
): Promise<HealthCheckResult[]> {
  const healthChecks = entities.map(entity =>
    checkHealthOfEntity(entity, requestTimeout, logger),
  );
  return await Promise.all(healthChecks);
}

async function checkHealthOfEntity(
  entity: Entity,
  requestTimeout: Duration,
  logger: Logger,
): Promise<HealthCheckResult> {
  const entityRef = getCompoundEntityRef(entity);
  const healthEndpoint = getHealthEndpoint(entity);

  const status = await checkHealth(healthEndpoint, logger, requestTimeout);

  return {
    entityRef: entityRef,
    url: healthEndpoint,
    status: status,
    timestamp: DateTime.now(),
  };
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
  timeoutSeconds: Duration = Duration.fromObject({ seconds: 5 }),
): Promise<Status> {
  if (!healthEndpoint)
    return unhealthy(`Invalid healthEndpoint (${healthEndpoint})`);

  try {
    const start = performance.now();
    const response = await fetchWithTimeout(healthEndpoint, timeoutSeconds);
    const end = performance.now();

    const responseTime = Math.round(end - start);

    return response.ok
      ? healthy(responseTime)
      : unhealthy(await response.text(), responseTime);
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
  timeout: Duration,
): string {
  if (error.name === 'AbortError') {
    return `Request for ${healthEndpoint} timed out because it took longer than ${timeout.toHuman()} to resolve`;
  } else if (error.message) {
    return `Request for ${healthEndpoint} failed - ${error.message}`;
  }
  return `Request for ${healthEndpoint} failed`;
}
