import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./cloudflare";

export async function uploadToS3(file: any, bucketName: any, key: any) {
  if (!file.buffer) {
    throw new Error("File buffer is undefined.");
  }

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await r2.send(new PutObjectCommand(uploadParams));
    console.log("Success", data);
  } catch (err) {
    console.error("Error during S3 upload:", err);
    throw err;
  }
}
