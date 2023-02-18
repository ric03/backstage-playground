import { errorHandler, PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { CatalogClient } from '@backstage/catalog-client';
import { loadHealthCheckEntities } from './entity-loader';
import { DatabaseHandler } from './DatabaseHandler';
import { getCompoundEntityRef } from '@backstage/catalog-model';
import {
  GetAllResponse,
  GetAllResponseEntityInfo,
  GetAllResponseHistory,
  HealthCheckEntity,
} from '@internal/plugin-health-check-common';

export interface RouterOptions {
  config: Config;
  databaseManager: PluginDatabaseManager;
  logger: Logger;
  catalogClient: CatalogClient;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, catalogClient, databaseManager } = options;

  const database = await DatabaseHandler.create(
    await databaseManager.getClient(),
  );

  logger.info(
    'Creating Router with Config',
    config.getOptionalConfig('healthCheck'),
  );

  const router = Router();
  router.use(express.json());

  router.get('/all', async (_, response) => {
    logger.info('GET health-check/all');

    const healthCheckEntities = await loadHealthCheckEntities(
      catalogClient,
      logger,
    );

    const items: Promise<HealthCheckEntity[]>[] = healthCheckEntities
      .map(getCompoundEntityRef)
      .map(
        async entityRef => await database.getHealthCheckEntries(entityRef, 25),
      )
      .filter(async list => (await list).length > 0);

    const collectedHealthChecks = await Promise.all(items);
    const data: GetAllResponse = toGetAllResponse(collectedHealthChecks);
    response.json(data);
  });

  router.get('/health', (_, response) => {
    logger.info('GET /health');
    response.json({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}

function toGetAllResponse(entities: HealthCheckEntity[][]): GetAllResponse {
  return {
    entities: entities.map(toEntityInfo),
  };
}

function toEntityInfo(entities: HealthCheckEntity[]): GetAllResponseEntityInfo {
  return {
    entityRef: entities[0].entityRef,
    status: { isHealthy: entities[0].isHealthy },
    history: entities.map(toHistory),
  };
}

function toHistory(entity: HealthCheckEntity): GetAllResponseHistory {
  return {
    url: entity.url,
    isHealthy: entity.isHealthy,
    errorMessage: entity.errorMessage,
    timestamp: entity.timestamp,
  };
}
