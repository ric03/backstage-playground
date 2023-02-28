import {
  DatabaseManager,
  getVoidLogger,
  PluginDatabaseManager,
} from '@backstage/backend-common';
import { MockConfigApi } from '@backstage/test-utils';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { CatalogClient } from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';

function createDatabase(): PluginDatabaseManager {
  return DatabaseManager.fromConfig(
    new ConfigReader({
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
        },
      },
    }),
  ).forPlugin('health-check');
}

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const discoveryApi = {
      async getBaseUrl() {
        return 'mockBaseUrl';
      },
    };

    const router = await createRouter({
      logger: getVoidLogger(),
      databaseManager: createDatabase(),
      config: new MockConfigApi({}),
      catalogClient: new CatalogClient({ discoveryApi }),
    });

    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
