import { checkHealth } from './health-check';
import fetchMock from 'jest-fetch-mock';
import { getVoidLogger } from '@backstage/backend-common';

describe('checkHealth', () => {
  const logger = getVoidLogger();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('with mocked fetch', () => {
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
          const result = await checkHealth(
            'https://dummy.url/api/health',
            logger,
          );

          expect(result).toBeTruthy();
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
          fetchMock.mockResponse('', { status });
          const result = await checkHealth(
            'https://dummy.url/api/health',
            logger,
          );

          expect(result).toBeFalsy();
        });
      });
    });

    it('should return false when fetch is rejected', async () => {
      fetchMock.mockReject(new Error('rejected'));
      const result = await checkHealth('https://dummy.url/api/health', logger);

      expect(result).toBeFalsy();
    });

    it('should return false when fetch is aborted', async () => {
      fetchMock.mockAbort();
      const result = await checkHealth('https://dummy.url/api/health', logger);

      expect(result).toBeFalsy();
    });
  });

  describe('with invalid parameter', () => {
    [
      undefined,
      '',
      'invalid-url',
      'dummy.url/missing-protocol',
      'ftp://dummy.url/invalid-protocol',
    ].forEach(param => {
      it(`should return false given param=${param}`, async () => {
        const result = await checkHealth(param, logger);

        expect(result).toBeFalsy();
      });
    });
  });
});
