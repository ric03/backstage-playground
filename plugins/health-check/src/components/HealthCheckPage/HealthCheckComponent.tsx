import React from 'react';
import {
  InfoCard,
  Link,
  Progress,
  StatusError,
  StatusOK,
} from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { GetAllResponseEntityInfo } from '@internal/plugin-health-check-common';
import { useApi } from '@backstage/core-plugin-api';
import { healthCheckApiRef } from '../../api';
import { useAsync } from 'react-use';
import Alert from '@material-ui/lab/Alert';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { ResponseTimingLineChart } from './ResponseTimingLineChart';

export function HealthCheckOverview() {
  const healthCheckApi = useApi(healthCheckApiRef);
  const {
    value: getAllResponse,
    error,
    loading,
  } = useAsync(() => healthCheckApi.getAllHealthChecks());

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <React.Fragment>
      {getAllResponse?.entities.map(data => (
        <HealthCheckCard key={stringifyEntityRef(data.entityRef)} data={data} />
      ))}
    </React.Fragment>
  );
}

interface StatusIndicatorOptions {
  isHealthy: boolean;
}
function StatusIndicator({ isHealthy }: StatusIndicatorOptions) {
  if (isHealthy) {
    return <StatusOK />;
  }
  return <StatusError />;
}

interface HealthCheckCardOptions {
  data: GetAllResponseEntityInfo;
}
function HealthCheckCard({ data }: HealthCheckCardOptions) {
  return (
    <InfoCard>
      <Grid container>
        <Grid item xs={4} lg={3}>
          <Grid container>
            <Grid item xs={1}>
              <StatusIndicator isHealthy={data.status.isHealthy} />
            </Grid>
            <Grid item xs={11}>
              <Typography variant="h6">
                <EntityRefLink
                  entityRef={data.entityRef}
                  title={data.entityRef.name}
                />
              </Typography>
              <Typography variant="body2">
                <Link to={data.history[0].url}>{data.history[0].url}</Link>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={8} lg={9}>
          <ResponseTimingLineChart arr={data.history} />
        </Grid>
      </Grid>
    </InfoCard>
  );
}
