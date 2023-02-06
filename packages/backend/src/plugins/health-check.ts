import { PluginEnvironment } from '../types';
import { Router } from 'express';
import { createRouter } from '@internal/plugin-health-check-backend';
import { CatalogClient } from '@backstage/catalog-client';

export default async function createPlugin({
  config,
  logger,
  discovery,
}: PluginEnvironment): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: discovery,
  });

  return await createRouter({
    config,
    logger,
    catalogClient,
  });
}
