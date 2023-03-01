import { errorHandler, PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { CatalogClient } from '@backstage/catalog-client';
import { loadHealthCheckEntities } from './entity-loader';
import { DatabaseHandler, HealthCheckEntity } from './DatabaseHandler';
import { getCompoundEntityRef } from '@backstage/catalog-model';
import {
  EntityInfo,
  GetAllResponse,
  ResponseTime,
  Status,
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

/**
 * Map the database entities into a response dto.
 * In case of a cold start or newly added, the entities may not have been probed, thus filtering them out.
 *
 * @param entities
 */
function toGetAllResponse(entities: HealthCheckEntity[][]): GetAllResponse {
  return {
    entities: entities.filter(notEmpty).map(toEntityInfo),
  };
}

function toEntityInfo(entities: HealthCheckEntity[]): EntityInfo {
  const latestCheck = entities[0];
  return {
    entityRef: latestCheck.entityRef,
    url: latestCheck.url,
    status: toStatus(latestCheck.isHealthy, latestCheck.responseTime ?? 0),
    history: entities.map(toEntityHistory),
  };
}

function toStatus(isHealthy: boolean, responseTime: number): Status {
  if (isHealthy) {
    if (responseTime >= 0 && responseTime < 400) {
      return Status.UP;
    }
    return Status.DEGRADED;
  }
  return Status.DOWN;
}

function toEntityHistory(entity: HealthCheckEntity): ResponseTime {
  return {
    timestamp: entity.timestamp.toMillis(),
    responseTime: entity.responseTime ?? 0,
  };
}
