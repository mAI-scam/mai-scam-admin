import { getS3ImageUrl } from "@/lib/s3ImageLoader";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return new Response("Missing key parameter", { status: 400 });
  }

  console.log(`S3 API: Requesting signed URL for key: ${key}`);

  try {
    const signedUrl = await getS3ImageUrl(key);

    if (!signedUrl) {
      return new Response("Failed to generate signed URL", { status: 500 });
    }

    return new Response(JSON.stringify({ url: signedUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(`S3 API: Error for key: ${key}`, error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
