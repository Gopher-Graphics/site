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
 * In production (when GCS_BUCKET is set) this will upload to Google Cloud Storage.
 * In development / tests the file is written to ./uploads/ on disk.
 *
 * @param base64Data  Full data URI, e.g. "data:image/png;base64,..."
 * @param folder      GCS prefix / local subdirectory (e.g. "avatars", "projects")
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

    if (process.env.GCS_BUCKET) {
        return uploadToGCS(base64Payload, folder, filename, mimeType);
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

// Google Cloud Storage upload (production)
async function uploadToGCS(
    base64Payload: string,
    folder: string,
    filename: string,
    contentType: string,
): Promise<UploadResult> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Storage } = require("@google-cloud/storage") as typeof import("@google-cloud/storage");

    const bucketName = process.env.GCS_BUCKET!;
    const key = `${folder}/${filename}`;

    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(key);

    await file.save(Buffer.from(base64Payload, "base64"), {
        metadata: { contentType },
        resumable: false,
    });

    // Make the file public if the bucket permissions aren't already set to allUsers
    // await file.makePublic(); 

    const url = `https://storage.googleapis.com/${bucketName}/${key}`;
    return { url, key };
}
