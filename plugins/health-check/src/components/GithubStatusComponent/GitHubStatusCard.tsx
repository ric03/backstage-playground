// curl 'https://www.githubstatus.com/api/v2/status.json'
// {
//    "page":{"id":"kctbh9vrtdwd","name":"GitHub","url":"https://www.githubstatus.com","time_zone":"Etc/UTC","updated_at":"2023-02-03T08:07:04.139Z"},
//    "status":{"indicator":"none","description":"All Systems Operational"}
// }

import { useAsync } from 'react-use';
import { Typography } from '@material-ui/core';
import { InfoCard, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import React from 'react';

export const GitHubStatusCard = () => (
  <InfoCard title="Github Status">
    <GitHubStatus />
  </InfoCard>
);

function GitHubStatus() {
  const { value: gitHubStatus, error, loading } = useAsync(loadGitHubStatus);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }
  return (
    <Typography variant="body1">{gitHubStatus?.status.description}</Typography>
  );
}

interface GithubStatusResponse {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  status: {
    indicator: string;
    description: string;
  };
}

async function loadGitHubStatus(): Promise<GithubStatusResponse> {
  const response = await fetch(
    'https://www.githubstatus.com/api/v2/status.json',
  );
  const data: GithubStatusResponse = await response.json();
  return data;
}
