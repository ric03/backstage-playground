import { Config } from '@backstage/config';
import { Duration } from 'luxon';
import { HumanDuration } from '@backstage/types';

type Schedule = { cron: string } | Duration | HumanDuration;
type Timeout = Duration | HumanDuration;
type InitialDelay = Duration | HumanDuration | undefined;

export class SchedulerConfig {
  private static readonly DEFAULT_SCHEDULE: Schedule = { seconds: 10 };
  private static readonly DEFAULT_TIMEOUT: Timeout = { seconds: 5 };
  private static readonly DEFAULT_INITIAL_DELAY: InitialDelay = { seconds: 15 };

  static fromConfig(config: Config) {
    const healthCheck = config.getOptionalConfig('health-check');

    const optionalSchedule = healthCheck?.getOptionalConfig('schedule');
    const schedule = (optionalSchedule ?? this.DEFAULT_SCHEDULE) as Schedule;

    const optionalTimeout = healthCheck?.getOptionalConfig('timeout');
    const timeout = (optionalTimeout ?? this.DEFAULT_TIMEOUT) as Timeout;

    const optionalInitialDelay = healthCheck?.getOptionalConfig('initialDelay');
    const initialDelay = (optionalInitialDelay ??
      this.DEFAULT_INITIAL_DELAY) as InitialDelay;

    return new SchedulerConfig(schedule, timeout, initialDelay);
  }

  constructor(
    public readonly schedule: Schedule,
    public readonly timeout: Timeout,
    public readonly initialDelay: InitialDelay,
  ) {}
}
