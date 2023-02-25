import React from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import {
  GetAllResponseEntityHistory,
  GetAllResponseEntityInfo,
} from '@internal/plugin-health-check-common';
import { useApi } from '@backstage/core-plugin-api';
import { healthCheckApiRef } from '../../api';
import { useAsync } from 'react-use';
import Alert from '@material-ui/lab/Alert';
import { stringifyEntityRef } from '@backstage/catalog-model';

const greenColor = '#3BA55C';
const redColor = '#ed4245';

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

interface HealthCheckCardOptions {
  data: GetAllResponseEntityInfo;
}

function HealthCheckCard({ data }: HealthCheckCardOptions) {
  return (
    <InfoCard>
      <Grid container>
        <Grid item xs={4}>
          <EntityRefLink
            entityRef={data.entityRef}
            title={data.entityRef.name}
          />
        </Grid>
        <Grid item xs={6}>
          <Grid container justifyContent="flex-end">
            <HistoryBars history={data.history} />
          </Grid>
        </Grid>
        <Grid item xs={2}>
          {data.status.isHealthy ? (
            <Typography style={{ color: greenColor }}> Up </Typography>
          ) : (
            <Typography style={{ color: redColor }}>Down</Typography>
          )}
        </Grid>
      </Grid>
    </InfoCard>
  );
}

interface HistoryBarsOptions {
  history: GetAllResponseEntityHistory[];
}

function HistoryBars({ history }: HistoryBarsOptions) {
  const bars = history.map((h, index) => (
    <HistorySingleBar key={index} historyItem={h} />
  ));
  return <React.Fragment>{bars}</React.Fragment>;
}

interface HistorySingleBarOptions {
  historyItem: GetAllResponseEntityHistory;
}

function HistorySingleBar({ historyItem }: HistorySingleBarOptions) {
  return (
    <div
      style={{
        display: 'inline-flex',
        backgroundColor: historyItem.isHealthy ? greenColor : redColor,
        width: '0.25rem',
        height: '1.75rem',
        marginRight: '0.25rem',
      }}
    />
  );
}
