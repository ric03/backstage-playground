import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
} from '@backstage/core-components';
import React from 'react';
import { HealthChecks } from '../HealthCheckComponent';

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
        <HealthChecks />
      </Content>
    </Page>
  );
};
