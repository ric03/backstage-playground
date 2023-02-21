import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
} from '@backstage/core-components';
import React from 'react';
import { GitHubStatusCard } from '../GithubStatusComponent';
import { HealthCheckOverview } from './HealthCheckComponent';

export const HealthCheckPage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Welcome to health-check!"
        subtitle="Here you can see the uptime of our services"
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="List of health checks">
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        <GitHubStatusCard />
        <HealthCheckOverview />
      </Content>
    </Page>
  );
};
