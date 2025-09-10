import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Environment variables (server-side only)
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET = "mai-scam-detected-images";

// AWS S3 configuration
const s3Client = new S3Client({
  region: AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || "",
    secretAccessKey: AWS_SECRET_ACCESS_KEY || "",
  },
});

// Helper function to check if S3 is properly configured
export const isS3Configured = (): boolean => {
  console.log("🔍 Checking S3 Configuration:");
  console.log("AWS_REGION:", AWS_REGION ? "✅ Set" : "❌ Missing");
  console.log(
    "AWS_ACCESS_KEY_ID:",
    AWS_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "AWS_SECRET_ACCESS_KEY:",
    AWS_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing"
  );
  console.log("S3_BUCKET:", S3_BUCKET);

  return !!(AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
};

// Generate signed URL for S3 image (server-side function)
export const getS3ImageUrl = async (s3Key: string): Promise<string | null> => {
  try {
    console.log(`Attempting to load S3 image with key: ${s3Key}`);

    // Check if S3 is configured
    if (!isS3Configured()) {
      console.error("S3 not properly configured - missing AWS credentials");
      return null;
    }

    // First, check if the object exists
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: S3_BUCKET,
          Key: s3Key,
        })
      );
      console.log(`S3 object exists for key: ${s3Key}`);
    } catch (error: any) {
      console.error(`S3 object not found or access denied for key: ${s3Key}`, {
        error: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
      });
      return null;
    }

    // Generate signed URL
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
      }),
      { expiresIn: 60 * 10 } // 10 minutes
    );

    console.log(`Successfully generated signed URL for key: ${s3Key}`);
    return signedUrl;
  } catch (error) {
    console.error(`Error loading S3 image for key: ${s3Key}`, error);
    return null;
  }
};

// Client-side function to fetch signed URL via API
interface S3ImageResponse {
  url: string;
}

export const fetchS3ImageUrl = async (
  s3Key: string
): Promise<string | null> => {
  try {
    console.log(`Client: Attempting to load S3 image with key: ${s3Key}`);
    const response = await fetch(
      `/api/s3-image?key=${encodeURIComponent(s3Key)}`
    );

    if (!response.ok) {
      console.error(
        `Client: Failed to get S3 image URL for key: ${s3Key}`,
        response.status
      );
      const errorText = await response.text();
      console.error(`Client: Error details: ${errorText}`);
      return null;
    }

    const data: S3ImageResponse = await response.json();
    console.log(`Client: Successfully got signed URL for key: ${s3Key}`);
    return data.url;
  } catch (error) {
    console.error(`Client: Error loading S3 image for key: ${s3Key}`, error);
    return null;
  }
};
