import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DashboardData } from "@/data/dummyDynamoDbData";

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
  extracted_data?: any;
  signals?: any;
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

// Helper function to extract country from analysis or domain
const extractCountry = (detection: DynamoScamDetection): string => {
  const analysis = detection.analysis_result?.analysis?.toLowerCase() || "";
  const domain =
    detection.extracted_data?.metadata?.domain || detection.url || "";

  // Simple country detection based on analysis content and domain
  if (analysis.includes("malaysia") || domain.includes(".my"))
    return "Malaysia";
  if (analysis.includes("singapore") || domain.includes(".sg"))
    return "Singapore";
  if (analysis.includes("philippines") || domain.includes(".ph"))
    return "Philippines";
  if (analysis.includes("thailand") || domain.includes(".th"))
    return "Thailand";
  if (analysis.includes("vietnam") || domain.includes(".vn")) return "Vietnam";
  if (analysis.includes("indonesia") || domain.includes(".id"))
    return "Indonesia";

  return "Southeast Asia";
};

// Main function to fetch all dashboard data from DynamoDB
export const fetchDashboardDataFromDynamoDB =
  async (): Promise<DashboardData | null> => {
    try {
      console.log("Fetching scam detection data from DynamoDB...");

      // Fetch scam detection data
      const scamDetections = await fetchScamDetectionsFromDynamoDB();

      // If we don't have any data, return null to trigger fallback
      if (!scamDetections.length) {
        console.log("No scam detection data found in DynamoDB");
        return null;
      }

      // Transform DynamoDB data to match our interface
      const transformedDetections = scamDetections.map((detection) => ({
        id: detection["mai-scam"],
        detection_id: detection.detection_id,
        content_type: detection.content_type,
        risk_level: (detection.analysis_result?.risk_level || "未知") as
          | "低"
          | "中"
          | "高"
          | "高风险",
        target_language: detection.target_language,
        detected_language:
          detection.analysis_result?.detected_language ||
          detection.target_language,
        url: detection.url || detection.extracted_data?.metadata?.domain,
        domain:
          detection.extracted_data?.metadata?.domain ||
          detection.url?.split("/")[2],
        platform:
          detection.extracted_data?.signals?.platform_meta?.platform ||
          detection.platform,
        analysis:
          detection.analysis_result?.analysis || "No analysis available",
        recommended_action:
          detection.analysis_result?.recommended_action || "Review manually",
        created_at: detection.created_at,
        country: extractCountry(detection),
      }));

      // Calculate statistics
      const totalDetections = transformedDetections.length;
      const highRiskDetections = transformedDetections.filter(
        (d) =>
          d.risk_level.includes("高") ||
          d.risk_level.toLowerCase().includes("high")
      ).length;
      const websiteScams = transformedDetections.filter(
        (d) => d.content_type === "website"
      ).length;
      const emailScams = transformedDetections.filter(
        (d) => d.content_type === "email"
      ).length;
      const socialMediaScams = transformedDetections.filter(
        (d) => d.content_type === "socialmedia"
      ).length;

      // Calculate language distribution
      const languageMap = new Map<string, number>();
      transformedDetections.forEach((detection) => {
        const lang = detection.target_language;
        languageMap.set(lang, (languageMap.get(lang) || 0) + 1);
      });

      const topTargetLanguages = Array.from(languageMap.entries())
        .map(([lang, count]) => ({
          language:
            lang === "zh"
              ? "Chinese (中文)"
              : lang === "ms"
              ? "Malay (Bahasa)"
              : lang === "en"
              ? "English"
              : lang === "vi"
              ? "Vietnamese (Tiếng Việt)"
              : lang === "th"
              ? "Thai (ไทย)"
              : lang,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate risk distribution
      const riskMap = new Map<string, number>();
      transformedDetections.forEach((detection) => {
        const risk = detection.risk_level;
        riskMap.set(risk, (riskMap.get(risk) || 0) + 1);
      });

      const riskDistribution = Array.from(riskMap.entries()).map(
        ([risk, count]) => ({
          risk,
          count,
          percentage: Math.round((count / totalDetections) * 100 * 10) / 10,
        })
      );

      // Calculate regional insights
      const countryMap = new Map<string, any>();
      transformedDetections.forEach((detection) => {
        const country = detection.country || "Unknown";
        if (!countryMap.has(country)) {
          countryMap.set(country, {
            detections: 0,
            highRisk: 0,
            scamTypes: new Set(),
          });
        }
        const data = countryMap.get(country);
        data.detections++;
        if (
          detection.risk_level.includes("高") ||
          detection.risk_level.toLowerCase().includes("high")
        ) {
          data.highRisk++;
        }
        // Add scam type based on content_type
        if (detection.content_type === "website")
          data.scamTypes.add("Website Scams");
        if (detection.content_type === "email")
          data.scamTypes.add("Email Phishing");
        if (detection.content_type === "socialmedia")
          data.scamTypes.add("Social Media Scams");
      });

      const regionalInsights = Array.from(countryMap.entries())
        .map(([country, data]) => ({
          country,
          flag:
            country === "Malaysia"
              ? "🇲🇾"
              : country === "Singapore"
              ? "🇸🇬"
              : country === "Philippines"
              ? "🇵🇭"
              : country === "Thailand"
              ? "🇹🇭"
              : country === "Vietnam"
              ? "🇻🇳"
              : country === "Indonesia"
              ? "🇮🇩"
              : "🌏",
          detections: data.detections,
          highRisk: data.highRisk,
          commonScamTypes: Array.from(data.scamTypes).slice(0, 3) as string[],
          trend: "stable" as const,
          trendPercentage: "+0%",
        }))
        .sort((a, b) => b.detections - a.detections);

      // Get top domains
      const domainMap = new Map<string, { count: number; riskLevel: string }>();
      transformedDetections.forEach((detection) => {
        if (detection.domain) {
          const existing = domainMap.get(detection.domain);
          if (existing) {
            existing.count++;
            // Keep highest risk level
            if (
              detection.risk_level.includes("高") &&
              !existing.riskLevel.includes("高")
            ) {
              existing.riskLevel = detection.risk_level;
            }
          } else {
            domainMap.set(detection.domain, {
              count: 1,
              riskLevel: detection.risk_level,
            });
          }
        }
      });

      const topDomains = Array.from(domainMap.entries())
        .map(([domain, data]) => ({
          domain,
          count: data.count,
          riskLevel: data.riskLevel,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const transformedData: DashboardData = {
        stats: {
          totalDetections,
          highRiskDetections,
          websiteScams,
          emailScams,
          socialMediaScams,
          topTargetLanguages,
          riskDistribution,
        },
        recentDetections: transformedDetections.slice(0, 20), // Latest 20
        regionalInsights,
        threatTrends: [], // Would need historical data to calculate trends
        topDomains,
      };

      console.log(
        "Successfully fetched and processed scam detection data from DynamoDB"
      );
      return transformedData;
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
