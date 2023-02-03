import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';
import { GitHubStatusComponent } from '../GithubStatusComponent';

export const HealthCheckPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Welcome to health-check!" subtitle="Optional subtitle">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Plugin title">
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <GitHubStatusComponent />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
