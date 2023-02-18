import { CatalogClient } from '@backstage/catalog-client';
import { Logger } from 'winston';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { loadHealthCheckEntities } from './entity-loader';
import { executeHealthChecks, HealthCheckResult } from './health-check';
import { Config } from '@backstage/config';
import { SchedulerConfig } from './schedulerConfig';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { DatabaseHandler } from './DatabaseHandler';
import { HealthCheckEntity } from '@internal/plugin-health-check-common';

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

  await scheduler.scheduleTask({
    id: 'health-check',
    frequency: schedulerConfig.schedule,
    timeout: schedulerConfig.timeout,
    initialDelay: { seconds: 5 },
    fn: async () => {
      logger.info(`Starting to run scheduled task 'health-check'`);
      await runHealthCheckTask(catalogClient, databaseHandler, logger);
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
  logger: Logger,
) {
  const entities = await loadHealthCheckEntities(catalogClient, logger);
  const healthCheckResults = await executeHealthChecks(entities, logger);

  const dbEntities = healthCheckResults.map(toEntity);
  await db.addMultipleHealthChecks(dbEntities);
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
