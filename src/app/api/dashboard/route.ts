import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { processScamData } from "@/lib/scamDataProcessor";

// Environment variables (server-side only)
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const DYNAMODB_SCAM_TABLE = process.env.DYNAMODB_SCAM_TABLE;

// AWS DynamoDB configuration (server-side)
let dynamoClient: DynamoDBClient | null = null;
let docClient: DynamoDBDocumentClient | null = null;

// Initialize DynamoDB client only if credentials are available
if (AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  dynamoClient = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
  docClient = DynamoDBDocumentClient.from(dynamoClient);
}

// Table name for scam detection results
const SCAM_DETECTION_TABLE =
  DYNAMODB_SCAM_TABLE || "mai-scam-detection-results";

// Flexible interface for DynamoDB scam detection data
interface DynamoScamDetection {
  "mai-scam": string;
  detection_id: string;
  created_at: string;
  content_type: unknown;
  target_language: string;
  timestamp?: string;
  ttl?: number;
  analysis_result?: {
    risk_level?: unknown;
    analysis?: unknown;
    detected_language?: unknown;
    recommended_action?: unknown;
    legitimate_url?: unknown;
    [key: string]: unknown;
  };
  extracted_data?: {
    metadata?: {
      domain?: unknown;
      [key: string]: unknown;
    };
    signals?: {
      platform_meta?: {
        platform?: unknown;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  signals?: Record<string, unknown>;
  url?: unknown;
  domain?: unknown;
  platform?: unknown;
  content?: unknown;
  [key: string]: unknown;
}

// Helper function to check if DynamoDB is properly configured
const isDynamoDBConfigured = (): boolean => {
  console.log("🔍 Checking DynamoDB Configuration (Server-side):");
  console.log("AWS_REGION:", AWS_REGION ? "✅ Set" : "❌ Missing");
  console.log(
    "AWS_ACCESS_KEY_ID:",
    AWS_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "AWS_SECRET_ACCESS_KEY:",
    AWS_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "DYNAMODB_SCAM_TABLE:",
    DYNAMODB_SCAM_TABLE || "Using default: mai-scam-detection-results"
  );

  return !!(
    AWS_REGION &&
    AWS_ACCESS_KEY_ID &&
    AWS_SECRET_ACCESS_KEY &&
    docClient
  );
};

// Fetch scam detections from DynamoDB
const fetchScamDetectionsFromDynamoDB = async () => {
  if (!docClient) {
    throw new Error("DynamoDB client not configured");
  }

  try {
    const command = new ScanCommand({
      TableName: SCAM_DETECTION_TABLE,
      Limit: 100, // Get recent detections
      FilterExpression: "attribute_exists(analysis_result)", // Ensure complete records
    });

    const response = await docClient.send(command);
    return (response.Items as DynamoScamDetection[]) || [];
  } catch (error) {
    console.error("Error fetching scam detections from DynamoDB:", error);
    throw error;
  }
};

// API endpoint to get dashboard data
export async function GET() {
  try {
    console.log("📊 Dashboard API endpoint called");

    // Check if DynamoDB is configured
    if (!isDynamoDBConfigured()) {
      console.log("❌ DynamoDB not configured, returning configuration status");
      return NextResponse.json(
        {
          success: false,
          error: "DynamoDB not configured",
          configured: false,
          message:
            "Please set AWS environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY",
        },
        { status: 400 }
      );
    }

    console.log("✅ DynamoDB is configured, fetching data...");

    // Fetch raw scam detections from DynamoDB
    const rawScamDetections = await fetchScamDetectionsFromDynamoDB();

    // If we don't have any data, return empty result
    if (!rawScamDetections.length) {
      console.log("⚠️ No scam detection data found in DynamoDB");
      return NextResponse.json(
        {
          success: false,
          error: "No data found",
          configured: true,
          message: "DynamoDB is configured but no data was found in the table",
        },
        { status: 404 }
      );
    }

    // Use the shared processing utility to transform the data
    const processedData = processScamData(rawScamDetections);

    console.log(
      `✅ Successfully fetched and processed ${rawScamDetections.length} scam detection records from DynamoDB`
    );

    return NextResponse.json({
      success: true,
      data: processedData,
      configured: true,
      recordCount: rawScamDetections.length,
    });
  } catch (error) {
    console.error("❌ Error in dashboard API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        configured: isDynamoDBConfigured(),
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// API endpoint to check configuration status
export async function HEAD() {
  const configured = isDynamoDBConfigured();
  return new NextResponse(null, {
    status: configured ? 200 : 400,
    headers: {
      "X-DynamoDB-Configured": configured.toString(),
    },
  });
}
