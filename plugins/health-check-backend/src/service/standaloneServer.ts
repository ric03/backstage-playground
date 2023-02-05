import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';
import {
  CatalogClient,
  CatalogRequestOptions,
  GetEntitiesRequest,
  GetEntitiesResponse,
} from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const config = ConfigReader.fromConfigs([]);

  const logger = options.logger.child({ service: 'health-check-backend' });
  logger.debug('Starting application server...');

  class MockCatalogClient extends CatalogClient {
    constructor() {
      const discoveryApi = {
        async getBaseUrl() {
          return 'http://localhost:7007/health-check/catalog-mock';
        },
      };

      super({ discoveryApi });
    }

    getEntities(
      _request?: GetEntitiesRequest,
      _options?: CatalogRequestOptions,
    ): Promise<GetEntitiesResponse> {
      return Promise.resolve({
        items: [
          {
            metadata: {
              name: 'github-health-endpoint',
              annotations: {
                'health-check/url':
                  'https://www.githubstatus.com/api/v2/status.json',
              },
            },
            apiVersion: 'irrelevant',
            kind: 'irrelevant',
          },
          {
            metadata: {
              name: 'test-entity',
              annotations: {
                'health-check/url': 'http://localhost:7007/health-check/health',
              },
            },
            apiVersion: 'irrelevant',
            kind: 'irrelevant',
          },
        ],
      });
    }
  }

  const router = await createRouter({
    config,
    logger,
    catalogClient: new MockCatalogClient(),
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/health-check', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
