// Scam data processing utilities for converting raw DynamoDB data to dashboard format

import {
  ScamDetection,
  ScamStats,
  RegionalInsight,
  ThreatTrend,
  DashboardData,
} from "@/data/dummyDynamoDbData";

// Define a flexible type for raw detection data from NoSQL (DynamoDB)
interface RawDetection {
  "mai-scam": string;
  detection_id: string;
  content_type: unknown; // Flexible for NoSQL
  target_language: string;
  created_at: string;
  analysis_result?: {
    risk_level?: unknown;
    analysis?: unknown;
    detected_language?: unknown;
    recommended_action?: unknown;
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
  url?: unknown;
  platform?: unknown;
  [key: string]: unknown; // Allow any additional fields from NoSQL
}

// Helper function to safely convert unknown to string
const safeString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
};

// Helper function to extract country from analysis or domain
export const extractCountry = (detection: RawDetection): string => {
  const analysis = safeString(
    detection.analysis_result?.analysis
  ).toLowerCase();
  const domain =
    safeString(detection.extracted_data?.metadata?.domain) ||
    safeString(detection.url);

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

// Helper function to safely get content type
const safeContentType = (
  value: unknown
): "website" | "email" | "socialmedia" => {
  const str = safeString(value).toLowerCase();
  if (str === "website" || str === "email" || str === "socialmedia") {
    return str as "website" | "email" | "socialmedia";
  }
  return "website"; // default fallback
};

// Helper function to safely get risk level
const safeRiskLevel = (value: unknown): "Low" | "Medium" | "High" => {
  const str = safeString(value);
  if (str.includes("低") || str.toLowerCase().includes("low")) return "Low";
  if (str.includes("中") || str.toLowerCase().includes("medium"))
    return "Medium";

  if (str.includes("高") || str.toLowerCase().includes("high")) return "High";
  return "Low"; // fallback to lowest risk
};

// Transform raw DynamoDB data to ScamDetection format
export const transformRawDetections = (
  rawData: RawDetection[]
): ScamDetection[] => {
  return rawData.map((detection) => {
    const url =
      safeString(detection.url) ||
      safeString(detection.extracted_data?.metadata?.domain);
    const domain =
      safeString(detection.extracted_data?.metadata?.domain) ||
      (url ? url.split("/")[2] : "");

    return {
      id: detection["mai-scam"],
      detection_id: detection.detection_id,
      content_type: safeContentType(detection.content_type),
      risk_level: safeRiskLevel(detection.analysis_result?.risk_level),
      target_language: detection.target_language,
      detected_language:
        safeString(detection.analysis_result?.detected_language) ||
        detection.target_language,
      url: url || undefined,
      domain: domain || undefined,
      platform:
        safeString(
          detection.extracted_data?.signals?.platform_meta?.platform
        ) ||
        safeString(detection.platform) ||
        undefined,
      analysis:
        safeString(detection.analysis_result?.analysis) ||
        "No analysis available",
      recommended_action:
        safeString(detection.analysis_result?.recommended_action) ||
        "Review manually",
      created_at: detection.created_at,
      country: extractCountry(detection),
    };
  });
};

// Calculate statistics from transformed detections
export const calculateStats = (detections: ScamDetection[]): ScamStats => {
  const totalDetections = detections.length;
  const highRiskDetections = detections.filter(
    (d) =>
      d.risk_level.toLowerCase().includes("high") ||
      d.risk_level.toLowerCase().includes("critical")
  ).length;
  const websiteScams = detections.filter(
    (d) => d.content_type === "website"
  ).length;
  const emailScams = detections.filter(
    (d) => d.content_type === "email"
  ).length;
  const socialMediaScams = detections.filter(
    (d) => d.content_type === "socialmedia"
  ).length;

  // Calculate language distribution
  const languageMap = new Map<string, number>();
  detections.forEach((detection) => {
    const lang = detection.target_language;
    languageMap.set(lang, (languageMap.get(lang) || 0) + 1);
  });

  const topTargetLanguages = Array.from(languageMap.entries())
    .map(([lang, count]) => ({
      language:
        lang === "zh"
          ? "Chinese"
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
  detections.forEach((detection) => {
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

  return {
    totalDetections,
    highRiskDetections,
    websiteScams,
    emailScams,
    socialMediaScams,
    topTargetLanguages,
    riskDistribution,
  };
};

// Calculate regional insights from transformed detections
export const calculateRegionalInsights = (
  detections: ScamDetection[]
): RegionalInsight[] => {
  const countryMap = new Map<
    string,
    {
      detections: number;
      highRisk: number;
      scamTypes: Set<string>;
    }
  >();
  detections.forEach((detection) => {
    const country = detection.country || "Unknown";
    if (!countryMap.has(country)) {
      countryMap.set(country, {
        detections: 0,
        highRisk: 0,
        scamTypes: new Set(),
      });
    }
    const data = countryMap.get(country);
    if (data) {
      data.detections++;
      if (
        detection.risk_level.toLowerCase().includes("high") ||
        detection.risk_level.toLowerCase().includes("critical")
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
    }
  });

  return Array.from(countryMap.entries())
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
};

// Calculate top domains from transformed detections
export const calculateTopDomains = (
  detections: ScamDetection[]
): { domain: string; count: number; riskLevel: string }[] => {
  const domainMap = new Map<string, { count: number; riskLevel: string }>();
  detections.forEach((detection) => {
    if (detection.domain) {
      const existing = domainMap.get(detection.domain);
      if (existing) {
        existing.count++;
        // Keep highest risk level
        if (
          (detection.risk_level.toLowerCase().includes("high") ||
            detection.risk_level.toLowerCase().includes("critical")) &&
          !(
            existing.riskLevel.toLowerCase().includes("high") ||
            existing.riskLevel.toLowerCase().includes("critical")
          )
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

  return Array.from(domainMap.entries())
    .map(([domain, data]) => ({
      domain,
      count: data.count,
      riskLevel: data.riskLevel,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

// Generate mock threat trends (would be replaced with real historical data)
export const generateThreatTrends = (
  detections: ScamDetection[]
): ThreatTrend[] => {
  // For now, generate mock trends based on current data distribution
  const websiteCount = detections.filter(
    (d) => d.content_type === "website"
  ).length;
  const emailCount = detections.filter(
    (d) => d.content_type === "email"
  ).length;
  const socialMediaCount = detections.filter(
    (d) => d.content_type === "socialmedia"
  ).length;

  // Generate 7 days of mock trend data
  const trends: ThreatTrend[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Simulate some variation in the data
    const variation = 0.8 + Math.random() * 0.4; // 80% to 120% of base values
    const websites = Math.max(0, Math.round((websiteCount * variation) / 7));
    const emails = Math.max(0, Math.round((emailCount * variation) / 7));
    const socialMedia = Math.max(
      0,
      Math.round((socialMediaCount * variation) / 7)
    );

    trends.push({
      date: dateStr,
      websites,
      emails,
      socialMedia,
      total: websites + emails + socialMedia,
    });
  }

  return trends;
};

// Main function to process raw DynamoDB data into dashboard format
export const processScamData = (rawData: RawDetection[]): DashboardData => {
  const transformedDetections = transformRawDetections(rawData);
  const stats = calculateStats(transformedDetections);
  const regionalInsights = calculateRegionalInsights(transformedDetections);
  const topDomains = calculateTopDomains(transformedDetections);
  const threatTrends = generateThreatTrends(transformedDetections);

  return {
    stats,
    recentDetections: transformedDetections,
    regionalInsights,
    threatTrends,
    topDomains,
  };
};
