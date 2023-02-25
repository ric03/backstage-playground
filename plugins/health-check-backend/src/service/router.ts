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
  GetAllResponseEntityHistory,
  GetAllResponseEntityInfo,
  HealthCheckEntity,
} from '@internal/plugin-health-check-common';
import { notEmpty } from './util';

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
    // todo pass limit via queryparam
    const unresolvedDatabaseRequests: Promise<HealthCheckEntity[]>[] =
      healthCheckEntities
        .map(getCompoundEntityRef)
        .map(entityRef => database.getHealthChecks(entityRef, 100));

    const collectedHealthChecks = await Promise.all(unresolvedDatabaseRequests);
    // in case of a cold start or newly added, the entities may not have been probed
    const nonEmptyHealthChecks = collectedHealthChecks.filter(notEmpty);
    const data: GetAllResponse = toGetAllResponse(nonEmptyHealthChecks);
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
    history: entities.map(toEntityHistory),
  };
}

function toEntityHistory(
  entity: HealthCheckEntity,
): GetAllResponseEntityHistory {
  return {
    url: entity.url,
    isHealthy: entity.isHealthy,
    errorMessage: entity.errorMessage,
    timestamp: entity.timestamp,
  };
}
