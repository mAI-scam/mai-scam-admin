import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DashboardData } from "@/data/dummyDynamoDbData";
import { processScamData } from "@/lib/scamDataProcessor";

// AWS DynamoDB configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table name for scam detection results
const SCAM_DETECTION_TABLE =
  process.env.NEXT_PUBLIC_DYNAMODB_SCAM_TABLE || "mai-scam-detection-results";

// Interfaces for DynamoDB scam detection data
interface DynamoScamDetection {
  "mai-scam": string; // partition key
  detection_id: string;
  created_at: string;
  content_type: "website" | "email" | "socialmedia";
  target_language: string;
  timestamp: string;
  ttl: number;
  analysis_result: {
    risk_level: string;
    analysis: string;
    detected_language: string;
    recommended_action: string;
    legitimate_url?: string;
  };
  extracted_data?: {
    metadata?: {
      domain?: string;
    };
    signals?: {
      platform_meta?: {
        platform?: string;
      };
    };
  };
  signals?: Record<string, unknown>;
  url?: string;
  domain?: string;
  platform?: string;
  content?: string;
}

// Fetch scam detections from DynamoDB
export const fetchScamDetectionsFromDynamoDB = async () => {
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
    return [];
  }
};

// Note: Country extraction logic moved to scamDataProcessor.ts for reusability

// Main function to fetch all dashboard data from DynamoDB
export const fetchDashboardDataFromDynamoDB =
  async (): Promise<DashboardData | null> => {
    try {
      console.log("Fetching scam detection data from DynamoDB...");

      // Fetch raw scam detections from DynamoDB
      const rawScamDetections = await fetchScamDetectionsFromDynamoDB();

      // If we don't have any data, return null to trigger fallback
      if (!rawScamDetections.length) {
        console.log("No scam detection data found in DynamoDB");
        return null;
      }

      // Use the shared processing utility to transform the data
      const processedData = processScamData(rawScamDetections);

      console.log(
        `Successfully fetched and processed ${rawScamDetections.length} scam detection records from DynamoDB`
      );
      return processedData;
    } catch (error) {
      console.error("Error fetching dashboard data from DynamoDB:", error);
      return null;
    }
  };

// Helper function to check if DynamoDB is properly configured
export const isDynamoDBConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_AWS_REGION &&
    process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID &&
    process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  );
};
