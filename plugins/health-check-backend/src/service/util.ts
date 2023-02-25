import { Duration } from 'luxon';

/**
 * Check if an array is not empty
 *
 * @param arr
 * @return true if array is not empty, otherwise false
 */
export function notEmpty(arr: any[]): boolean {
  return arr.length > 0;
}

/**
 * Fetch an url with a timeout.
 *
 * The default timeout of nodejs is too long (120 secs).
 * https://dmitripavlutin.com/timeout-fetch-request/
 */
export async function fetchWithTimeout(
  healthEndpoint: string,
  timeout: Duration,
) {
  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    timeout.toMillis(),
  );
  const response = await fetch(healthEndpoint, {
    signal: abortController.signal,
  });
  clearTimeout(timeoutId);
  return response;
}
