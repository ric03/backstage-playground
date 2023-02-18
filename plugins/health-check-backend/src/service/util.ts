/**
 * Fetch an url with a timeout.
 *
 * The default timeout of nodejs is too long (120 secs).
 * https://dmitripavlutin.com/timeout-fetch-request/
 */
export async function fetchWithTimeout(
  healthEndpoint: string,
  timeoutSeconds: number,
) {
  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    timeoutSeconds * 1000,
  );
  const response = await fetch(healthEndpoint, {
    signal: abortController.signal,
  });
  clearTimeout(timeoutId);
  return response;
}
