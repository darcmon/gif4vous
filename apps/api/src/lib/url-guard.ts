import { promises as dns } from 'node:dns';
import { isIP } from 'node:net';
import type { Result } from './storage.js';

/**
 * EXERCISE: the SSRF guard. Your server fetches user-supplied URLs, so it
 * must refuse to fetch anything that resolves to your own network.
 *
 * TODO(you): implement assertSafeUrl. Spec:
 *   1. new URL(raw) inside try/catch — malformed input must not crash.
 *   2. Protocol must be exactly "https:".
 *   3. Resolve the hostname: dns.lookup(hostname, { all: true }).
 *      (If the hostname is ALREADY an IP literal — check with isIP() —
 *       validate it directly, don't resolve.)
 *   4. Reject if ANY resolved address is private/reserved:
 *        10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16   (RFC1918)
 *        127.0.0.0/8 (loopback), 169.254.0.0/16 (link-local / cloud metadata)
 *        0.0.0.0, and for IPv6: ::1, fc00::/7, fe80::/10
 *   5. Return Result<URL> — { ok: true, value: parsedUrl } or a reason.
 *
 * Write a helper isPrivateIPv4(ip: string): boolean first; split on ".",
 * map Number, then range-check the octets. Good array-method practice.
 *
 * Test cases to try once wired up (all should be REJECTED):
 *   http://example.com            (not https)
 *   https://localhost/x.gif
 *   https://127.0.0.1/x.gif
 *   https://169.254.169.254/latest/meta-data/   (the cloud-credentials one)
 *   https://192.168.1.1/x.gif
 */
export async function assertSafeUrl(raw: string): Promise<Result<URL>> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: 'Malformed URL' };
  }

  if (url.protocol !== 'https:') {
    return { ok: false, error: 'Only https URLs are allowed' };
  }

  function isPrivateIPv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return true;

    const [a, b] = parts;
    if (a === undefined || b === undefined) return true;

    if (a === 10) return true;
    if (a === 172 && b >= 16) return true;

    return false;
  }

  return { ok: false, error: 'not implemented' };
}
