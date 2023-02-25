import { Config } from '@backstage/config';
import { Duration } from 'luxon';
import { HumanDuration } from '@backstage/types';

type Schedule = { cron: string } | Duration | HumanDuration;
type Timeout = Duration | HumanDuration;
type InitialDelay = Duration | HumanDuration | undefined;

export class SchedulerConfig {
  private static readonly DEFAULT_SCHEDULE: Schedule = { seconds: 60 };
  private static readonly DEFAULT_TIMEOUT: Timeout = { seconds: 5 };
  private static readonly DEFAULT_INITIAL_DELAY: InitialDelay = { seconds: 15 };

  static fromConfig(config: Config) {
    const healthCheck = config.getOptionalConfig('healthCheck');

    const optionalSchedule = healthCheck?.getOptional<Schedule>('schedule');
    const schedule = optionalSchedule ?? this.DEFAULT_SCHEDULE;

    const optionalTimeout = healthCheck?.getOptional<Timeout>('timeout');
    const timeout = optionalTimeout ?? this.DEFAULT_TIMEOUT;

    const optionalInitialDelay =
      healthCheck?.getOptional<InitialDelay>('initialDelay');
    const initialDelay = optionalInitialDelay ?? this.DEFAULT_INITIAL_DELAY;

    return new SchedulerConfig(schedule, timeout, initialDelay);
  }

  constructor(
    public readonly schedule: Schedule,
    public readonly timeout: Timeout,
    public readonly initialDelay: InitialDelay,
  ) {}
}
