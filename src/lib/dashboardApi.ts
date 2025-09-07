// Client-side service to fetch dashboard data from API endpoints
import { DashboardData } from "@/data/dummyDynamoDbData";

interface DashboardApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  configured: boolean;
  message?: string;
  recordCount?: number;
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

// Fetch dashboard data from server-side API
export const fetchDashboardDataFromAPI =
  async (): Promise<DashboardData | null> => {
    try {
      console.log("📡 Fetching dashboard data from API...");

      const response = await fetch("/api/dashboard", {
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
        return result.data;
      } else {
        console.log(`❌ API request failed: ${result.message || result.error}`);
        if (!result.configured) {
          console.log("🔧 DynamoDB is not configured on the server");
        }
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard data from API:", error);
      return null;
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
