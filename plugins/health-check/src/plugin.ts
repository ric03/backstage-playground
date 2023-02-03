import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const healthCheckPlugin = createPlugin({
  id: 'health-check',
  routes: {
    root: rootRouteRef,
  },
});

export const HealthCheckPage = healthCheckPlugin.provide(
  createRoutableExtension({
    name: 'HealthCheckPage',
    component: () =>
      import('./components/HealthCheckPage').then(m => m.HealthCheckPage),
    mountPoint: rootRouteRef,
  }),
);
