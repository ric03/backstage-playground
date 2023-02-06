import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { CatalogClient } from '@backstage/catalog-client';
import { runHealthChecks } from './health-check';
import { loadHealthCheckEntities } from './entities-loader';

export interface RouterOptions {
  config: Config;
  logger: Logger;
  catalogClient: CatalogClient;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, catalogClient } = options;
  logger.info('config', config.getOptionalConfig('healthCheck'));

  const router = Router();
  router.use(express.json());

  router.get('/all', async (_, response) => {
    logger.info('calling health-check/all');
    const healthCheckEntities = await loadHealthCheckEntities(
      catalogClient,
      logger,
    );
    const healthCheckResponses = await runHealthChecks(
      healthCheckEntities,
      logger,
    );
    response.json(healthCheckResponses);
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}
