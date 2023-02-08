import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { healthCheckApiRef, HealthCheckBackendClient } from './api';

export const healthCheckPlugin = createPlugin({
  id: 'health-check',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: healthCheckApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new HealthCheckBackendClient(discoveryApi),
    }),
  ],
});

export const HealthCheckPage = healthCheckPlugin.provide(
  createRoutableExtension({
    name: 'HealthCheckPage',
    component: () =>
      import('./components/HealthCheckPage').then(m => m.HealthCheckPage),
    mountPoint: rootRouteRef,
  }),
);
