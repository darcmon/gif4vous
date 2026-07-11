/**
 * EXERCISE: magic-byte sniffing with a discriminated union return type.
 * Never trust a URL's extension or a server's Content-Type header —
 * the first bytes of the file are the truth.
 *
 * Magic bytes (all at offset 0 unless noted):
 *   GIF:  47 49 46 38   ("GIF8" — covers GIF87a and GIF89a)
 *   PNG:  89 50 4E 47
 *   WEBP: 52 49 46 46 ("RIFF") at offset 0 AND 57 45 42 50 ("WEBP") at offset 8
 *
 * TODO(you): implement it. Hints:
 *   - buffer.subarray(0, 4).equals(Buffer.from([0x47, 0x49, 0x46, 0x38]))
 *   - Guard length first: a 3-byte buffer must not crash you.
 *     (Notice how noUncheckedIndexedAccess types buffer[i] as
 *      `number | undefined` — that's the compiler making you check.)
 *
 * Then write the narrowing at a call site:
 *   const detected = detectImageType(buf);
 *   if (detected.kind === "unknown") -> reject the siphon
 *   else -> detected.contentType is available (TS narrowed the union for you)
 */

export type DetectedImage =
  | { kind: "gif"; contentType: "image/gif" }
  | { kind: "png"; contentType: "image/png" }
  | { kind: "webp"; contentType: "image/webp" }
  | { kind: "unknown" };

export function detectImageType(buffer: Buffer): DetectedImage {
  // TODO(you)
  return { kind: "unknown" };
}
