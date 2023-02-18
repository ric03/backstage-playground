import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { HealthCheckPage, healthCheckPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(healthCheckPlugin)
  .addPage({
    element: <HealthCheckPage />,
    title: 'Root Page',
    path: '/health-check',
  })
  .render();
