import { CatalogClient } from '@backstage/catalog-client';
import { Logger } from 'winston';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { loadHealthCheckEntities } from './entity-loader';
import { executeHealthChecks, HealthCheckResult } from './health-check';
import { Config } from '@backstage/config';
import { SchedulerConfig } from './schedulerConfig';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { DatabaseHandler, HealthCheckEntity } from './DatabaseHandler';
import { Duration } from 'luxon';
import { HumanDuration } from '@backstage/types';

interface CreateHealthCheckSchedulerOptions {
  catalogClient: CatalogClient;
  config: Config;
  databaseManager: PluginDatabaseManager;
  logger: Logger;
  scheduler: PluginTaskScheduler;
}

export async function createScheduler(
  options: CreateHealthCheckSchedulerOptions,
) {
  const { catalogClient, config, logger, databaseManager, scheduler } = options;

  const schedulerConfig = SchedulerConfig.fromConfig(config);
  const databaseHandler = await DatabaseHandler.create(
    await databaseManager.getClient(),
  );

  logger.info(
    `Running with Scheduler Config ${JSON.stringify(schedulerConfig)}`,
  );

  const timeoutAsDuration = getOrConvertToDuration(schedulerConfig.timeout);

  await scheduler.scheduleTask({
    id: 'health-check',
    frequency: schedulerConfig.schedule,
    timeout: schedulerConfig.timeout,
    initialDelay: schedulerConfig.initialDelay,
    fn: async () => {
      logger.info(`Starting to run scheduled task 'health-check'`);
      await runHealthCheckTask(
        catalogClient,
        databaseHandler,
        timeoutAsDuration,
        logger,
      );
      logger.info(`Finished scheduled task 'health-check'`);
    },
  });

  // todo add cleanup scheduler, if an entity does not exist anymore
}

/**
 * Run the healthChecks
 */
async function runHealthCheckTask(
  catalogClient: CatalogClient,
  db: DatabaseHandler,
  requestTimeout: Duration,
  logger: Logger,
) {
  const entities = await loadHealthCheckEntities(catalogClient, logger);
  const healthCheckResults = await executeHealthChecks(
    entities,
    requestTimeout,
    logger,
  );

  const dbEntities = healthCheckResults.map(toEntity);
  await db.addMultipleHealthChecks(dbEntities);
}

function getOrConvertToDuration(
  durationLike: Duration | HumanDuration,
): Duration {
  if (Duration.isDuration(durationLike)) {
    return durationLike;
  }
  return Duration.fromDurationLike(durationLike);
}

function toEntity(result: HealthCheckResult): HealthCheckEntity {
  return {
    entityRef: result.entityRef,
    url: result.url,
    isHealthy: result.status.isHealthy,
    errorMessage: result.status.errorMessage,
    timestamp: result.timestamp,
  };
}
