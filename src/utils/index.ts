import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../middlewares/cloudflare";

export const capitalizeFirstLetter = (string: string) => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function getSignedUrlForKey(key: any) {
  if (!key) {
    console.warn("Empty value provided for key");
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2, command, { expiresIn: 604800 });
}

export async function deleteFromS3(bucketName: string, key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await r2.send(command);
  console.log(`Deleted ${key} from ${bucketName}`);
}
