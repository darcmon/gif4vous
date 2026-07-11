import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env, isDev } from '../config/env.js';
import { Upload } from '@aws-sdk/lib-storage';

/**
 * THE SEAM. The rest of the app imports upload / remove / getPublicUrl and
 * never knows whether it's talking to LocalStack, AWS, or (someday) Spaces.
 * Swapping providers should only ever touch this file + env vars.
 */

export const s3 = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  // LocalStack needs an explicit endpoint + path-style URLs.
  // Spread trick: adds these keys only when S3_ENDPOINT is set.
  ...(env.S3_ENDPOINT && {
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: true,
  }),
});

// A Result type instead of throwing. Callers are FORCED by the compiler to
// handle the failure branch — `if (!result.ok)` — before touching .value.
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function getPublicUrl(storageKey: string): string {
  if (env.S3_ENDPOINT) {
    return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${storageKey}`;
  }
  return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${storageKey}`;
}

export async function uploadBuffer(params: {
  buffer: Buffer;
  storageKey: string;
  contentType: string;
}): Promise<Result<{ url: string }>> {
  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: env.S3_BUCKET,
        Key: params.storageKey,
        Body: params.buffer,
        ContentType: params.contentType,
      },
    });
    await upload.done();
    return { ok: true, value: { url: getPublicUrl(params.storageKey) } };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function removeObject(storageKey: string): Promise<Result<null>> {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: storageKey,
      }),
    );
    return { ok: true, value: null };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
