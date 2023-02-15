import { CatalogClient } from '@backstage/catalog-client';
import { Logger } from 'winston';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { loadHealthCheckEntities } from './entity-loader';
import { executeHealthChecks } from './health-check';
import { Config } from '@backstage/config';
import { SchedulerConfig } from './schedulerConfig';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { DatabaseHandler } from './DatabaseHandler';

interface CreateHealthCheckSchedulerOptions {
  catalogClient: CatalogClient;
  config: Config;
  database: PluginDatabaseManager;
  logger: Logger;
  scheduler: PluginTaskScheduler;
}

export async function createScheduler(
  options: CreateHealthCheckSchedulerOptions,
) {
  const { catalogClient, config, logger, database, scheduler } = options;

  const schedulerConfig = SchedulerConfig.fromConfig(config);
  const db = await DatabaseHandler.create(await database.getClient());

  logger.info(
    `Running with Scheduler Config ${JSON.stringify(schedulerConfig)}`,
  );

  await scheduler.scheduleTask({
    id: 'health-check',
    frequency: schedulerConfig.schedule,
    timeout: schedulerConfig.timeout,
    initialDelay: { seconds: 5 },
    fn: async () => {
      await runHealthCheckTask(catalogClient, db, logger);
    },
  });
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
  const healthCheckResponse = await executeHealthChecks(entities, logger);

  // todo remove logging
  logger.info(
    `The healthCheckResponses: ${JSON.stringify(healthCheckResponse)}`,
  );
  await db.addMultipleHealthChecks(healthCheckResponse.items);

  const example = healthCheckResponse.items[4];
  logger.info(
    `the db result: ${JSON.stringify(
      await db.getHealthCheckList(example.entityRef, 99),
    )}`,
  );
}
