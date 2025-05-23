export async function compress(tables: string) {
  const stream = new Blob([tables], {
    type: 'application/json',
  }).stream();

  const compressedReadableStream = stream.pipeThrough(
    new CompressionStream('gzip'),
  );

  const compressedResponse = new Response(compressedReadableStream);

  const blob = await compressedResponse.blob();

  const buffer = await blob.arrayBuffer();

  const compressedBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return compressedBase64;
}

export async function decompress(storedTable: string) {
  const binaryString = atob(storedTable);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const stream = new Blob([bytes], {
    type: 'application/json',
  }).stream();

  const decompressedStream = stream.pipeThrough(
    new DecompressionStream('gzip'),
  );

  const resp = new Response(decompressedStream);
  const data = await resp.text();
  return data;
}
