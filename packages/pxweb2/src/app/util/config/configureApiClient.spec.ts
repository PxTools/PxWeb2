import { afterEach, describe, expect, it, vi } from 'vitest';
import Ajv from 'ajv';
import { OpenAPI, TablesService } from '@pxweb2/pxweb2-api-client';
import { getConfig } from '../config/getConfig';
import schema from '../config/config.schema.json';
import { configureApiClient } from './configureApiClient';

describe('configureApiClient', () => {
  const originalConfig = { ...OpenAPI };

  afterEach(() => {
    Object.assign(OpenAPI, originalConfig);
    vi.unstubAllGlobals();
  });

  it.each([true, false, undefined])(
    'sends cross-origin fetch credentials only when explicitly enabled (%s)',
    async (apiWithCredentials) => {
      // Arrange
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ tables: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      vi.stubGlobal('fetch', fetchMock);
      OpenAPI.BASE = 'https://api.example/v2';

      // Act
      configureApiClient({ ...getConfig(), apiWithCredentials });
      await TablesService.listAllTables('da', undefined, undefined, true, 1, 10000);

      // Assert
      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, request] = fetchMock.mock.calls[0];
      expect(url).toContain('https://api.example/v2/tables?');
      expect(request.method).toBe('GET');
      expect(request.credentials).toBe(
        apiWithCredentials === true ? 'include' : undefined,
      );
    },
  );

  it('resets credential opt-in when the next configuration omits it', () => {
    // Arrange
    configureApiClient({ ...getConfig(), apiWithCredentials: true });

    // Act
    configureApiClient(getConfig());

    // Assert
    expect(OpenAPI.WITH_CREDENTIALS).toBe(false);
  });

  it('does not enable credentials for a malformed runtime value', () => {
    // Arrange
    const config = {
      ...getConfig(),
      apiWithCredentials: 'true' as unknown as boolean,
    };

    // Act
    configureApiClient(config);

    // Assert
    expect(OpenAPI.WITH_CREDENTIALS).toBe(false);
  });
});

describe('apiWithCredentials configuration schema', () => {
  const validate = new Ajv().compile(schema);

  it.each([true, false, undefined])('accepts an optional boolean (%s)', (value) => {
    // Arrange
    const config = { ...getConfig(), apiWithCredentials: value };

    // Act / Assert
    expect(validate(config)).toBe(true);
  });

  it.each(['true', null, 1])('rejects a non-boolean value (%s)', (value) => {
    // Arrange
    const config = { ...getConfig(), apiWithCredentials: value };

    // Act / Assert
    expect(validate(config)).toBe(false);
  });
});
