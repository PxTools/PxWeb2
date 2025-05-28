import { compress, decompress } from './compression';

describe('compressed and decompressed data must be identical', async () => {
  const testString = 'A quick fox jumps over the lazy dog';
  const compressedTestString = await compress(testString);
  const decompressedTestString = await decompress(compressedTestString);
  it('should see the compressed and decompressed string be identical with the original', () => {
    expect(decompressedTestString).toBe(testString);
  });
});
