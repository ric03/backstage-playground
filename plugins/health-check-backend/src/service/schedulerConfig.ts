import { Config } from '@backstage/config';
import { Duration } from 'luxon';
import { HumanDuration } from '@backstage/types';

type Schedule = { cron: string } | Duration | HumanDuration;
type Timeout = Duration | HumanDuration;

export class SchedulerConfig {
  private static readonly DEFAULT_SCHEDULE: Schedule = { seconds: 30 };
  private static readonly DEFAULT_TIMEOUT: Timeout = { seconds: 25 };

  static fromConfig(config: Config) {
    const healthCheck = config.getOptionalConfig('health-check');

    const optionalSchedule = healthCheck?.getOptionalConfig('schedule');
    const schedule = (optionalSchedule ?? this.DEFAULT_SCHEDULE) as Schedule;

    const optionalTimeout = healthCheck?.getOptionalConfig('timeout');
    const timeout = (optionalTimeout ?? this.DEFAULT_TIMEOUT) as Timeout;

    return new SchedulerConfig(schedule, timeout);
  }

  constructor(
    public readonly schedule: Schedule,
    public readonly timeout: Timeout,
  ) {}
}
