import { S3Client } from "@aws-sdk/client-s3";
import { env, isDev } from "../config/env.js";

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
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function getPublicUrl(storageKey: string): string {
  // TODO(you): two URL shapes.
  //   dev  (LocalStack): `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${storageKey}`
  //   prod (AWS):        `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  // Use isDev (or the presence of S3_ENDPOINT) to branch.
  throw new Error("not implemented");
}

export async function uploadBuffer(params: {
  buffer: Buffer;
  storageKey: string;
  contentType: string;
}): Promise<Result<{ url: string }>> {
  // TODO(you):
  // 1. Import { Upload } from "@aws-sdk/lib-storage".
  // 2. new Upload({ client: s3, params: { Bucket, Key, Body, ContentType } })
  //    then await .done().
  // 3. Wrap in try/catch; return { ok: false, error } on failure instead of
  //    letting it throw. Return { ok: true, value: { url: getPublicUrl(...) } }.
  throw new Error("not implemented");
}

export async function removeObject(storageKey: string): Promise<Result<null>> {
  // TODO(you): DeleteObjectCommand + s3.send(), same Result pattern.
  throw new Error("not implemented");
}
