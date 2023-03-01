import { Header, Page } from '@backstage/core-components';
import React from 'react';
import { HealthCheckTabLayout } from './HealthCheckTabLayout';

export const HealthCheckPage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Down Detector"
        subtitle="Here you can see the uptime of our services"
      />
      <HealthCheckTabLayout />
    </Page>
  );
};
