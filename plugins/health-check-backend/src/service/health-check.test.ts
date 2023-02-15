import { checkHealth } from './health-check';
import fetchMock from 'jest-fetch-mock';
import { getVoidLogger } from '@backstage/backend-common';

describe('checkHealth', () => {
  const logger = getVoidLogger();

  describe('with mocked fetch', () => {
    const dummyUrl = 'https://dummy.url/api/health';

    beforeEach(() => {
      jest.resetAllMocks();
      fetchMock.enableMocks();
      fetchMock.doMock();
    });

    afterEach(() => {
      fetchMock.resetMocks();
      fetchMock.disableMocks();
    });

    describe('with status 2xx', () => {
      [
        // 2xx
        200, 201, 202, 203, 204, 205, 206,
      ].forEach(status => {
        it(`should return true when status is ${status}`, async () => {
          fetchMock.mockResponse('', { status });
          const result = await checkHealth(dummyUrl, logger);

          expect(result.isHealthy).toBeTruthy();
        });
      });
    });

    describe('with status 1xx / 3xx / 4xx / 5xx', () => {
      [
        // 1xx
        100, 101, 102, 103,
        // 3xx
        300, 301, 302, 303, 304, 305, 306, 307, 308,
        // 4xx
        401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
        415, 416, 417, 418,
        // 5xx
        500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511,
      ].forEach(status => {
        it(`should return false when status is ${status}`, async () => {
          fetchMock.mockResponse(`returning ${status}`, { status });
          const result = await checkHealth(dummyUrl, logger);

          expect(result.isHealthy).toBeFalsy();
          expect(result.errorMessage).toBe(`returning ${status}`);
        });
      });
    });

    it('should return false when fetch is rejected', async () => {
      fetchMock.mockReject(new Error('rejected'));

      const result = await checkHealth(dummyUrl, logger);

      expect(result.isHealthy).toBeFalsy();
      expect(result.errorMessage).toContain(
        `Request for ${dummyUrl} failed - rejected`,
      );
    });

    it('should return false when fetch is aborted', async () => {
      fetchMock.mockAbort();
      const result = await checkHealth(dummyUrl, logger);

      expect(result.isHealthy).toBeFalsy();
      expect(result.errorMessage).toContain(
        `Request for ${dummyUrl} timed out because it took longer than 5 seconds to resolve`,
      );
    });
  });

  describe('with invalid parameter', () => {
    [undefined, ''].forEach(invalidParam => {
      it(`should return false given param=${invalidParam}`, async () => {
        const result = await checkHealth(invalidParam, logger);

        expect(result.isHealthy).toBeFalsy();
        expect(result.errorMessage).toContain(
          `Invalid healthEndpoint (${invalidParam})`,
        );
      });
    });
  });

  describe('with invalid url', () => {
    [
      {
        invalidUrl: 'invalid-url',
        expectedErrorMessage: 'Only absolute URLs are supported',
      },
      {
        invalidUrl: 'dummy.url/missing-protocol',
        expectedErrorMessage: 'Only absolute URLs are supported',
      },
      {
        invalidUrl: 'ftp://dummy.url/invalid-protocol',
        expectedErrorMessage: 'Only HTTP(S) protocols are supported',
      },
    ].forEach(({ invalidUrl, expectedErrorMessage }) => {
      it(`should return false given param=${invalidUrl}`, async () => {
        const result = await checkHealth(invalidUrl, logger);

        expect(result.isHealthy).toBeFalsy();
        expect(result.errorMessage).toContain(
          `Request for ${invalidUrl} failed - ${expectedErrorMessage}`,
        );
      });
    });
  });
});
