import { logger } from "@/lib/logger";
import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface UploadParams {
  key: string;
  body: Buffer | string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  etag?: string;
}

interface StorageProvider {
  upload(params: UploadParams): Promise<UploadResult>;
  getSignedUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

/**
 * S3-compatible storage provider using AWS SDK v3 with SigV4 signing.
 * Works with AWS S3, Cloudflare R2, MinIO, and other S3-compatible services.
 *
 * Requires env vars:
 *   S3_ENDPOINT          - e.g. https://<account>.r2.cloudflarestorage.com
 *   S3_ACCESS_KEY_ID
 *   S3_SECRET_ACCESS_KEY
 *   S3_BUCKET            - e.g. regsguard-uploads
 *   S3_REGION            - e.g. us-east-1 (default: auto)
 *   S3_PUBLIC_URL        - e.g. https://uploads.regsguard.com (optional)
 */
class S3Storage implements StorageProvider {
  private bucket: string;
  private publicUrl: string;
  private client: import("@aws-sdk/client-s3").S3Client;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT!;
    this.bucket = process.env.S3_BUCKET!;
    this.publicUrl = process.env.S3_PUBLIC_URL || `${endpoint}/${this.bucket}`;


    this.client = new S3Client({
      endpoint,
      region: process.env.S3_REGION || "auto",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async upload(params: UploadParams): Promise<UploadResult> {

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      })
    );

    logger.info("File uploaded to S3", { key: params.key, size: params.body.length });

    return {
      url: `${this.publicUrl}/${params.key}`,
      key: params.key,
    };
  }

  async getSignedUrl(key: string): Promise<string> {

    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: 3600 } // 1 hour
    );

    return url;
  }

  async delete(key: string): Promise<void> {

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
    logger.info("File deleted from S3", { key });
  }
}

/**
 * Local file system storage (development fallback).
 */
class LocalStorage implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = path.join(process.cwd(), "uploads");
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const filePath = path.join(this.basePath, params.key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, params.body);

    logger.info("File saved locally", { key: params.key, path: filePath });

    return {
      url: `/api/uploads/${params.key}`,
      key: params.key,
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    return `/api/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    await fs.unlink(filePath).catch(() => {});
    logger.info("File deleted locally", { key });
  }
}

function isS3Configured(): boolean {
  return !!(
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET
  );
}

/**
 * Get the active storage provider.
 * Uses S3/R2 if configured, otherwise falls back to local filesystem.
 */
export function getStorage(): StorageProvider {
  if (isS3Configured()) {
    return new S3Storage();
  }
  return new LocalStorage();
}

/**
 * Generate a unique storage key for a file upload.
 */
export function generateStorageKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = path.extname(fileName);
  const safeName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
  return `${userId}/${timestamp}-${random}-${safeName}${ext}`;
}
