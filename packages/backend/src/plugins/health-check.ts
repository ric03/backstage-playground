import { PluginEnvironment } from '../types';
import { Router } from 'express';
import {
  createRouter,
  createScheduler,
} from '@internal/plugin-health-check-backend';
import { CatalogClient } from '@backstage/catalog-client';

export default async function createPlugin({
  config,
  database: databaseManager,
  logger,
  discovery,
  scheduler,
}: PluginEnvironment): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: discovery,
  });

  await createScheduler({
    catalogClient,
    config,
    databaseManager,
    logger,
    scheduler,
  });

  return await createRouter({
    config,
    databaseManager,
    logger,
    catalogClient,
  });
}
