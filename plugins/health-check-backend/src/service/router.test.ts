import { getVoidLogger } from '@backstage/backend-common';
import { MockConfigApi } from '@backstage/test-utils';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { CatalogClient } from '@backstage/catalog-client';

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
