import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { CatalogClient } from '@backstage/catalog-client';
import { executeHealthChecks } from './health-check';
import { loadHealthCheckEntities } from './entity-loader';

export interface RouterOptions {
  config: Config;
  logger: Logger;
  catalogClient: CatalogClient;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, catalogClient } = options;

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
    // fixme load from DB
    const healthCheckResponses = await executeHealthChecks(
      healthCheckEntities,
      logger,
    );
    response.json(healthCheckResponses);
  });

  router.get('/health', (_, response) => {
    logger.info('GET /health');
    response.json({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}
