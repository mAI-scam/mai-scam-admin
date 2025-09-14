// Client-side service to fetch dashboard data from API endpoints
import { DashboardData } from "@/data/dummyDynamoDbData";

interface DashboardApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  configured: boolean;
  message?: string;
  recordCount?: number;
  pagination?: {
    hasMore: boolean;
    lastEvaluatedKey?: Record<string, any>;
    scannedCount: number;
    count: number;
  };
}

// Check if DynamoDB is configured (server-side)
export const checkDynamoDBConfiguration = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/dashboard", { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error("Error checking DynamoDB configuration:", error);
    return false;
  }
};

// Fetch dashboard data from server-side API with pagination support
export const fetchDashboardDataFromAPI = async (
  page: number = 1,
  limit: number = 100,
  lastEvaluatedKey?: Record<string, any>
): Promise<{
  data: DashboardData | null;
  pagination?: DashboardApiResponse["pagination"];
}> => {
  try {
    console.log(
      `📡 Fetching dashboard data from API (page: ${page}, limit: ${limit})...`
    );

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (lastEvaluatedKey) {
      params.append(
        "lastEvaluatedKey",
        encodeURIComponent(JSON.stringify(lastEvaluatedKey))
      );
    }

    const response = await fetch(`/api/dashboard?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result: DashboardApiResponse = await response.json();

    if (result.success && result.data) {
      console.log(
        `✅ Successfully fetched ${result.recordCount} records from API`
      );
      return { data: result.data, pagination: result.pagination };
    } else {
      console.log(`❌ API request failed: ${result.message || result.error}`);
      if (!result.configured) {
        console.log("🔧 DynamoDB is not configured on the server");
      }
      return { data: null };
    }
  } catch (error) {
    console.error("❌ Error fetching dashboard data from API:", error);
    return { data: null };
  }
};

// Helper function to check if DynamoDB is configured (replaces the client-side version)
export const isDynamoDBConfigured = async (): Promise<boolean> => {
  try {
    return await checkDynamoDBConfiguration();
  } catch (error) {
    console.error("Error checking DynamoDB configuration:", error);
    return false;
  }
};
