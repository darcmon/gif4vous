export type DetectedImage =
  | { kind: 'gif'; contentType: 'image/gif' }
  | { kind: 'png'; contentType: 'image/png' }
  | { kind: 'webp'; contentType: 'image/webp' }
  | { kind: 'unknown' };

export function detectImageType(buffer: Buffer): DetectedImage {
  function isGif(buffer: Buffer): boolean {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }

  function isPng(buffer: Buffer): boolean {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  function isWebp(buffer: Buffer): boolean {
    return (
      // RIFF at offset 0
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      // WEBP at offset 8
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    );
  }

  if (isGif(buffer)) return { kind: 'gif', contentType: 'image/gif' };
  if (isPng(buffer)) return { kind: 'png', contentType: 'image/png' };
  if (isWebp(buffer)) return { kind: 'webp', contentType: 'image/webp' };
  return { kind: 'unknown' };
}
