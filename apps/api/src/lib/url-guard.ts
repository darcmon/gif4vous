import { promises as dns } from 'node:dns';
import { isIP } from 'node:net';
import type { Result } from './storage.js';

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
    if (!parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255))
      return true;

    const [a, b] = parts;
    if (a === undefined || b === undefined) return true;

    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;

    return false;
  }

  const hostname = url.hostname;
  const ipVersion = isIP(hostname);

  if (ipVersion === 4) {
    if (isPrivateIPv4(hostname)) {
      return { ok: false, error: 'URL resolves to a private IP address' };
    }
    return { ok: true, value: url };
  }

  if (ipVersion === 6) {
    // Not handling IPv6 private-range logic in this pass — reject outright
    // rather than let an unchecked IPv6 literal through.
    return { ok: false, error: 'IPv6 addresses are not supported' };
  }

  // Not a literal IP — it's a hostname. Resolve it and check every address
  // it points to, since an attacker only needs one record to be private.
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const { address, family } of addresses) {
      if (family === 6) {
        return { ok: false, error: 'IPv6 addresses are not supported' };
      }
      if (family === 4 && isPrivateIPv4(address)) {
        return {
          ok: false,
          error: 'Hostname resolves to a private IP address',
        };
      }
    }
  } catch {
    return { ok: false, error: 'DNS resolution failed' };
  }

  return { ok: true, value: url };
}
