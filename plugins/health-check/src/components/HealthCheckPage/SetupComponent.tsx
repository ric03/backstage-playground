import React from 'react';
import {
  Content,
  ContentHeader,
  MissingAnnotationEmptyState,
  SupportButton,
} from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { HEALTHCHECK_URL_ANNOTATION } from '@internal/plugin-health-check-common';

export function SetupComponent() {
  return (
    <Content>
      <ContentHeader title="Setup">
        <SupportButton>A description of your plugin goes here.</SupportButton>
      </ContentHeader>
      <Typography>
        You can add your own service to the list. You just have to add the
        following annotation, the rest happens automagically.
      </Typography>
      <div>
        <MissingAnnotationEmptyState
          annotation={[HEALTHCHECK_URL_ANNOTATION]}
          readMoreUrl="link to example"
        />
      </div>
      <Typography variant="h5" style={{ marginTop: '8px' }}>
        Note
      </Typography>
      <Typography>
        It may take a while until your component is visible.
      </Typography>
    </Content>
  );
}
