import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface UploadResult {
    url: string;
    /** provider-specific identifier; null for local uploads */
    key: string | null;
}

/**
 * Upload an image from a base64 data-URI string.
 *
 * In production (when S3_BUCKET is set) this will POST to S3 using the AWS SDK.
 * In development / tests the file is written to ./uploads/ on disk and a
 * relative URL is returned.
 *
 * @param base64Data  Full data URI, e.g. "data:image/png;base64,..."
 * @param folder      S3 prefix / local subdirectory (e.g. "avatars", "projects")
 */
export async function uploadImage(base64Data: string, folder = "uploads"): Promise<UploadResult> {
    // Validate basic data-URI shape.
    const dataUriRegex = /^data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+);base64,(.+)$/;
    const match = base64Data.match(dataUriRegex);
    if (!match) {
        throw new Error("Invalid image data – expected a base64 data URI");
    }

    const mimeType = match[1];
    const base64Payload = match[2];
    const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
    const filename = `${crypto.randomUUID()}.${ext}`;

    if (process.env.S3_BUCKET) {
        return uploadToS3(base64Payload, folder, filename, mimeType);
    }
    return saveLocally(base64Payload, folder, filename);
}

// local filesystem fallback (dev / test)
async function saveLocally(base64Payload: string, folder: string, filename: string): Promise<UploadResult> {
    const dir = path.join(process.cwd(), "uploads", folder);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Payload, "base64"));
    const url = `/uploads/${folder}/${filename}`;
    return { url, key: null };
}

// s3 upload (production)
async function uploadToS3(
    base64Payload: string,
    folder: string,
    filename: string,
    contentType: string,
): Promise<UploadResult> {
    // Dynamically import so S3_BUCKET=undefined environments don't need the SDK installed.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3");

    const bucket = process.env.S3_BUCKET!;
    const region = process.env.S3_REGION ?? "us-east-1";
    const key = `${folder}/${filename}`;

    const client = new S3Client({ region });
    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: Buffer.from(base64Payload, "base64"),
            ContentType: contentType,
        }),
    );

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return { url, key };
}
