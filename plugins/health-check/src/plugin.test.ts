import { healthCheckPlugin } from './plugin';

describe('health-check', () => {
  it('should export plugin', () => {
    expect(healthCheckPlugin).toBeDefined();
  });
});
