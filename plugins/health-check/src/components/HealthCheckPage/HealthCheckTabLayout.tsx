import { TabbedLayout } from '@backstage/core-components';
import React from 'react';
import { HealthCheckOverview } from './HealthCheckComponent';
import { SetupComponent } from './SetupComponent';

export function HealthCheckTabLayout() {
  return (
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="Health Checks">
        <HealthCheckOverview />
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/setup" title="Setup">
        <SetupComponent />
      </TabbedLayout.Route>
    </TabbedLayout>
  );
}
