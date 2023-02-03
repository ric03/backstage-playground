import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { healthCheckPlugin, HealthCheckPage } from '../src/plugin';

createDevApp()
  .registerPlugin(healthCheckPlugin)
  .addPage({
    element: <HealthCheckPage />,
    title: 'Root Page',
    path: '/health-check'
  })
  .render();
