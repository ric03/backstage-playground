import React from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import {
  HealthCheckItem,
  HealthCheckResponse,
} from '@internal/plugin-health-check-common';
import { useAsync } from 'react-use';
import Alert from '@material-ui/lab/Alert';
import { GitHubStatusComponent } from './GithubStatusComponent';
import { useApi } from '@backstage/core-plugin-api';
import { healthCheckApiRef } from '../api';

export function HealthChecks() {
  const healthCheckApi = useApi(healthCheckApiRef);
  const {
    value: healthCheckResponse,
    error,
    loading,
  } = useAsync(() => healthCheckApi.runAllHealthChecks());

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }
  return <HealthCheckGrid healthCheckResponse={healthCheckResponse} />;
}

interface HealthCheckGridOptions {
  healthCheckResponse?: HealthCheckResponse;
}

function HealthCheckGrid({ healthCheckResponse }: HealthCheckGridOptions) {
  return (
    <Grid container spacing={3} direction="column">
      <Grid item>
        <GitHubStatusComponent />
      </Grid>
      {healthCheckResponse &&
        healthCheckResponse.items.map((item, index) => (
          <Grid item key={index}>
            <HealthCheckComponent healthCheckItem={item} />{' '}
          </Grid>
        ))}
    </Grid>
  );
}

interface HealthCheckComponentOptions {
  healthCheckItem: HealthCheckItem;
}

export function HealthCheckComponent({
  healthCheckItem: item,
}: HealthCheckComponentOptions) {
  return (
    <InfoCard>
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={8}>
          <EntityRefLink
            entityRef={item.entityRef}
            title={item.entityRef.name}
          />
        </Grid>
        <Grid item md={4}>
          <Typography>{item.isHealthy ? 'Operational' : 'Error'}</Typography>
        </Grid>
        {item.errorMessage && (
          <Grid item md={12}>
            <Typography>{item.errorMessage}</Typography>
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );
}
