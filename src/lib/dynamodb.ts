import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DashboardData } from "@/data/dummyDynamoDbData";
import { processScamData } from "@/lib/scamDataProcessor";

// Environment variables
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const DYNAMODB_SCAM_TABLE = process.env.DYNAMODB_SCAM_TABLE;

// AWS DynamoDB configuration
const dynamoClient = new DynamoDBClient({
  region: AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || "",
    secretAccessKey: AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table name for scam detection results
const SCAM_DETECTION_TABLE =
  DYNAMODB_SCAM_TABLE || "mai-scam-detection-results";

// Flexible interface for DynamoDB scam detection data (matches RawDetection)
interface DynamoScamDetection {
  "mai-scam": string; // partition key
  detection_id: string;
  created_at: string;
  content_type: unknown; // Flexible for NoSQL
  target_language: string;
  timestamp?: string;
  ttl?: number;
  analysis_result?: {
    risk_level?: unknown;
    analysis?: unknown;
    detected_language?: unknown;
    recommended_action?: unknown;
    legitimate_url?: unknown;
    [key: string]: unknown; // Allow additional fields
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
  [key: string]: unknown; // Allow any additional fields from NoSQL
}

// Fetch scam detections from DynamoDB with pagination support
export const fetchScamDetectionsFromDynamoDB = async (
  limit: number = 100,
  lastEvaluatedKey?: Record<string, any>
) => {
  try {
    const command = new ScanCommand({
      TableName: SCAM_DETECTION_TABLE,
      Limit: limit,
      FilterExpression: "attribute_exists(analysis_result)", // Ensure complete records
      ExclusiveStartKey: lastEvaluatedKey, // For pagination
    });

    const response = await docClient.send(command);
    return {
      items: (response.Items as DynamoScamDetection[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count || 0,
      scannedCount: response.ScannedCount || 0,
    };
  } catch (error) {
    console.error("Error fetching scam detections from DynamoDB:", error);
    return {
      items: [],
      lastEvaluatedKey: undefined,
      count: 0,
      scannedCount: 0,
    };
  }
};

// Note: Country extraction logic moved to scamDataProcessor.ts for reusability

// Main function to fetch all dashboard data from DynamoDB with pagination
export const fetchDashboardDataFromDynamoDB = async (
  limit: number = 100,
  lastEvaluatedKey?: Record<string, any>
): Promise<{ data: DashboardData | null; pagination?: any }> => {
  try {
    console.log("Fetching scam detection data from DynamoDB...");

    // Fetch raw scam detections from DynamoDB
    const result = await fetchScamDetectionsFromDynamoDB(
      limit,
      lastEvaluatedKey
    );

    // If we don't have any data, return null to trigger fallback
    if (!result.items.length) {
      console.log("No scam detection data found in DynamoDB");
      return { data: null };
    }

    // Use the shared processing utility to transform the data
    const processedData = processScamData(result.items);

    console.log(
      `Successfully fetched and processed ${result.items.length} scam detection records from DynamoDB`
    );

    return {
      data: processedData,
      pagination: {
        hasMore: !!result.lastEvaluatedKey,
        lastEvaluatedKey: result.lastEvaluatedKey,
        scannedCount: result.scannedCount,
        count: result.count,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data from DynamoDB:", error);
    return { data: null };
  }
};

// Helper function to check if DynamoDB is properly configured
export const isDynamoDBConfigured = (): boolean => {
  console.log("🔍 Checking DynamoDB Configuration:");
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

  return !!(AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
};
