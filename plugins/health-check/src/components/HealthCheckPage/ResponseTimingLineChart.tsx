import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GetAllResponseEntityHistory } from '@internal/plugin-health-check-common';
import { DateTime } from 'luxon';

interface Options {
  arr: GetAllResponseEntityHistory[];
}
export function ResponseTimingLineChart({ arr }: Options) {
  const data = arr.map(it => ({
    timestamp: it.timestamp.toMillis(),
    responseTime: it.responseTime,
  }));

  const tickFormatter = (millis: number) =>
    DateTime.fromMillis(millis).toFormat('HH:mm');

  const labelFormatter = (millis: number) =>
    DateTime.fromMillis(millis).toLocaleString(DateTime.DATETIME_SHORT);

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart
        data={data}
        margin={{ top: 0, right: 25, left: 25, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          scale="time"
          type="number"
          domain={['auto', 'auto']}
          tickFormatter={tickFormatter}
        />
        <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
        <Tooltip labelFormatter={labelFormatter} />
        <Line dataKey="responseTime" />
      </LineChart>
    </ResponsiveContainer>
  );
}
