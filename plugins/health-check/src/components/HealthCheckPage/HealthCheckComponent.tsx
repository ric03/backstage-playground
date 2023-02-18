import React from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { GetAllResponseEntityInfo } from '@internal/plugin-health-check-common';
import { useApi } from '@backstage/core-plugin-api';
import { healthCheckApiRef } from '../../api';
import { useAsync } from 'react-use';
import Alert from '@material-ui/lab/Alert';
import { stringifyEntityRef } from '@backstage/catalog-model';

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

  return getAllResponse?.entities.map(data => (
    <HealthCheckCard key={stringifyEntityRef(data.entityRef)} data={data} />
  ));
}

interface HealthCheckCardOptions {
  data: GetAllResponseEntityInfo;
}

function HealthCheckCard({ data }: HealthCheckCardOptions) {
  return (
    <InfoCard>
      <EntityRefLink entityRef={data.entityRef} title={data.entityRef.name} />
      <Typography>{data.status.isHealthy ? 'Up' : 'Down'}</Typography>
      <br />
      <Typography>{JSON.stringify(data)}</Typography>
    </InfoCard>
  );
}

// export function HealthCheckGrid({
//   healthCheckResponse,
// }: HealthCheckGridOptions) {
//   return (
//     <Grid container spacing={3} direction="column">
//       <Grid item>
//         <GitHubStatusComponent />
//       </Grid>
//       {healthCheckResponse &&
//         healthCheckResponse.entities.map((item, index) => (
//           <Grid item key={index}>
//             <HealthCheckComponent item={item} />{' '}
//           </Grid>
//         ))}
//     </Grid>
//   );
// }
//
// interface HealthCheckComponentOptions {
//   item: GetAllResponseEntityInfo;
// }
//
// export function HealthCheckComponent({ item }: HealthCheckComponentOptions) {
//   return (
//     <InfoCard>
//       <Grid container spacing={3} alignItems="stretch">
//         <Grid item md={8}>
//           <EntityRefLink
//             entityRef={item.entityRef}
//             title={item.entityRef.name}
//           />
//         </Grid>
//         <Grid item md={4}>
//           <Typography>{item.status.isHealthy ? 'Up' : 'Down'}</Typography>
//         </Grid>
//       </Grid>
//     </InfoCard>
//   );
// }
