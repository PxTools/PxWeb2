import pxDetector from './pxDetector';
import { getConfig } from '../app/util/config/getConfig';

const config = getConfig();

describe('pxDetector', () => {
  it('should return the default language from config', () => {
    const result = pxDetector.lookup();

    expect(result).toBe(config.language.defaultLanguage);
  });

  it('should have the correct name', () => {
    expect(pxDetector.name).toBe('pxDetector');
  });
});
