"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getDummyData, DashboardData } from "@/data/dummyDynamoDbData";
import {
  fetchDashboardDataFromAPI,
  isDynamoDBConfigured,
} from "@/lib/dashboardApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<"dummy" | "dynamodb">("dummy");
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const navigation = [
    { name: "Overview", id: "overview", icon: "🛡️" },
    { name: "Detections", id: "detections", icon: "🔍" },
    { name: "Language Insights", id: "language", icon: "🌐" },
    { name: "Threat Analysis", id: "threats", icon: "⚠️" },
  ];

  const loadDashboardData = async (isRefresh = false) => {
    if (!user) return;

    // If it's not a refresh and we already have data, don't reload
    if (!isRefresh && hasLoadedData) {
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    try {
      if (user.authType === "test") {
        // Test user always gets dummy data
        console.log("Loading dummy data for test user...");
        const data = await getDummyData();
        setDashboardData(data);
        setDataSource("dummy");
      } else if (user.authType === "google") {
        // Google user gets DynamoDB data if configured, otherwise dummy data
        console.log("Loading data for Google user...");

        const isConfigured = await isDynamoDBConfigured();
        if (isConfigured) {
          console.log(
            "DynamoDB is configured, attempting to fetch real data..."
          );
          const dynamoData = await fetchDashboardDataFromAPI();

          if (dynamoData) {
            setDashboardData(dynamoData);
            setDataSource("dynamodb");
            console.log("Successfully loaded DynamoDB data");
          } else {
            console.log("No DynamoDB data found, falling back to dummy data");
            const data = await getDummyData();
            setDashboardData(data);
            setDataSource("dummy");
          }
        } else {
          console.log("DynamoDB not configured, using dummy data");
          console.log(
            "To use real data, please set up these environment variables on the server:"
          );
          console.log("- AWS_REGION");
          console.log("- AWS_ACCESS_KEY_ID");
          console.log("- AWS_SECRET_ACCESS_KEY");
          console.log(
            "- DYNAMODB_SCAM_TABLE (optional, defaults to 'mai-scam-detection-results')"
          );
          const data = await getDummyData();
          setDashboardData(data);
          setDataSource("dummy");
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to dummy data on any error
      const data = await getDummyData();
      setDashboardData(data);
      setDataSource("dummy");
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
      setHasLoadedData(true);
    }
  };

  useEffect(() => {
    // Reset the loaded data flag when user changes
    setHasLoadedData(false);
    loadDashboardData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const getDataSourceBadge = () => {
    if (dataSource === "dynamodb") {
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: "#49A4EF" }}
        >
          🔴 Live Data
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: "#EB6700" }}
      >
        🧪 Test Data
      </span>
    );
  };

  const renderConfigurationBanner = () => {
    if (user?.authType === "google" && dataSource === "dummy") {
      return (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Using Test Data - DynamoDB Not Configured
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  You&apos;re signed in with Google, but showing test data
                  because AWS DynamoDB is not configured on the server.
                </p>
                <p className="mt-1">
                  To see real scam detection data, please set up these
                  environment variables in your <code>.env</code> file:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-xs font-mono">
                  <li>AWS_REGION</li>
                  <li>AWS_ACCESS_KEY_ID</li>
                  <li>AWS_SECRET_ACCESS_KEY</li>
                  <li>DYNAMODB_SCAM_TABLE (optional)</li>
                </ul>
                <p className="mt-2 text-xs">
                  Note: These are server-side environment variables and should
                  NOT use NEXT_PUBLIC_ prefix for security.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    // Only show full loading screen on initial load when we have no data
    if (isInitialLoading && !dashboardData) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading dashboard data...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {user?.authType === "google"
                ? "Fetching from DynamoDB..."
                : "Loading test data..."}
            </p>
          </div>
        </div>
      );
    }

    // If we don't have data yet, show loading
    if (!dashboardData) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading dashboard data...
            </p>
          </div>
        </div>
      );
    }

    const sectionProps = {
      data: dashboardData,
      dataSource,
      authType: user?.authType || "test",
      isRefreshing,
    };

    switch (activeSection) {
      case "overview":
        return <OverviewSection {...sectionProps} />;
      case "detections":
        return <DetectionsSection {...sectionProps} />;
      case "language":
        return <LanguageInsightsSection {...sectionProps} />;
      case "threats":
        return <ThreatAnalysisSection {...sectionProps} />;
      default:
        return <OverviewSection {...sectionProps} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center px-4 h-full">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="mAIscam Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                <span style={{ color: "#49A4EF" }}>m</span>
                <span style={{ color: "#EB6700" }}>AI</span>
                <span style={{ color: "#49A4EF" }}>scam</span>
              </h1>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                style={
                  activeSection === item.id
                    ? { backgroundColor: "#EB6700" }
                    : {}
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                {user?.avatar && user.avatar.startsWith("http") ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || "User"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user?.name?.charAt(0) || "👤"
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "#EB6700" }}
          >
            🚪 Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mr-4"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
                {activeSection}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => loadDashboardData(true)}
                disabled={isRefreshing}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ color: "#49A4EF" }}
                title="Refresh data"
              >
                <svg
                  className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {getDataSourceBadge()}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden p-6">
          {renderConfigurationBanner()}
          {children || renderContent()}
        </main>
      </div>
    </div>
  );
};

// Section component props interface
interface SectionProps {
  data: DashboardData;
  dataSource: "dummy" | "dynamodb";
  authType: "test" | "google";
  isRefreshing?: boolean;
}

// Overview Section - Scam Detection Dashboard
const OverviewSection: React.FC<SectionProps> = ({
  data,
  dataSource,
  isRefreshing,
}) => {
  // First row stats
  const mainStats = [
    {
      name: "Total Detections",
      value: data.stats.totalDetections.toLocaleString(),
      icon: "🛡️",
      color: "#49A4EF",
      bgColor: "rgba(73, 164, 239, 0.1)",
      additionalInfo: `${data.stats.highRiskDetections.toLocaleString()} high risk`,
    },
    {
      name: "Website Scams",
      value: data.stats.websiteScams.toLocaleString(),
      icon: "🌐",
      color: "#49A4EF",
      bgColor: "rgba(73, 164, 239, 0.1)",
    },
    {
      name: "Email Phishing",
      value: data.stats.emailScams.toLocaleString(),
      icon: "📧",
      color: "#EB6700",
      bgColor: "rgba(235, 103, 0, 0.1)",
    },
    {
      name: "Social Media X",
      value: data.stats.socialMediaScams.toLocaleString(),
      icon: "📱",
      color: "#EB6700",
      bgColor: "rgba(235, 103, 0, 0.1)",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {isRefreshing && (
        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
          <span>Refreshing...</span>
        </div>
      )}

      {/* First Row - Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mainStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.additionalInfo && (
                  <p
                    className="text-xs font-medium mt-1"
                    style={{ color: "#EB6700" }}
                  >
                    ⚠️ {stat.additionalInfo}
                  </p>
                )}
              </div>
              <div
                className="text-xl p-2 rounded-full"
                style={{ backgroundColor: stat.bgColor }}
              >
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row - Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Risk Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Distribution
          </h3>
          <div className="flex-1 h-48">
            {(() => {
              // Order risks: Low -> Medium -> High
              const orderedRisks = [
                data.stats.riskDistribution.find((r) =>
                  r.risk.toLowerCase().includes("low")
                ) || data.stats.riskDistribution[0],
                data.stats.riskDistribution.find((r) =>
                  r.risk.toLowerCase().includes("medium")
                ) || data.stats.riskDistribution[1],
                data.stats.riskDistribution.find(
                  (r) =>
                    r.risk.toLowerCase().includes("high") ||
                    r.risk.toLowerCase().includes("critical")
                ) || data.stats.riskDistribution[2],
              ].filter(Boolean);

              const chartData = {
                labels: orderedRisks.map((risk) => risk.risk),
                datasets: [
                  {
                    label: "Count",
                    data: orderedRisks.map((risk) => risk.count),
                    backgroundColor: orderedRisks.map((risk) =>
                      risk.risk.toLowerCase().includes("high") ||
                      risk.risk.toLowerCase().includes("critical")
                        ? "#DC2626"
                        : risk.risk.toLowerCase().includes("medium")
                        ? "#F59E0B"
                        : "#059669"
                    ),
                    borderColor: orderedRisks.map((risk) =>
                      risk.risk.toLowerCase().includes("high") ||
                      risk.risk.toLowerCase().includes("critical")
                        ? "#DC2626"
                        : risk.risk.toLowerCase().includes("medium")
                        ? "#F59E0B"
                        : "#059669"
                    ),
                    borderWidth: 0,
                    borderRadius: 4,
                    borderSkipped: false,
                  },
                ],
              };

              const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "white",
                    bodyColor: "white",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    callbacks: {
                      label: function (context: any) {
                        const risk = orderedRisks[context.dataIndex];
                        return `${risk.risk}: ${risk.count} (${risk.percentage}%)`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: "#6B7280",
                      font: {
                        size: 11,
                      },
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: "#6B7280",
                      font: {
                        size: 11,
                      },
                    },
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "index" as const,
                },
              };

              return <Bar data={chartData} options={options} />;
            })()}
          </div>
        </div>

        {/* Detected Languages */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Southeast Asia Language Overview
          </h3>
          <div className="flex-1 h-48">
            {(() => {
              const topLanguages = data.languageInsights.slice(0, 6);
              const totalDetections = topLanguages.reduce(
                (sum, lang) => sum + lang.detections,
                0
              );

              // Generate colors for each language
              const colors = [
                "#49A4EF", // Blue
                "#EB6700", // Orange
                "#059669", // Green
                "#7C3AED", // Purple
                "#DC2626", // Red
                "#F59E0B", // Yellow
              ];

              const chartData = {
                labels: topLanguages.map((lang) => lang.language),
                datasets: [
                  {
                    data: topLanguages.map((lang) => lang.detections),
                    backgroundColor: colors.slice(0, topLanguages.length),
                    borderColor: colors
                      .slice(0, topLanguages.length)
                      .map((color) => color),
                    borderWidth: 2,
                    hoverOffset: 4,
                  },
                ],
              };

              const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: {
                        size: 11,
                      },
                      color: "#374151",
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "white",
                    bodyColor: "white",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    callbacks: {
                      label: function (context: any) {
                        const language = topLanguages[context.dataIndex];
                        const percentage = (
                          (language.detections / totalDetections) *
                          100
                        ).toFixed(1);
                        return `${
                          language.language
                        }: ${language.detections.toLocaleString()} detections (${percentage}%)`;
                      },
                      afterLabel: function (context: any) {
                        const language = topLanguages[context.dataIndex];
                        return `High Risk: ${language.highRisk}`;
                      },
                    },
                  },
                },
                interaction: {
                  intersect: false,
                },
              };

              return <Pie data={chartData} options={options} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Detections Section - Recent Scam Detections
const DetectionsSection: React.FC<SectionProps> = ({ data, dataSource }) => {
  const getRiskLevelColor = (riskLevel: string) => {
    if (
      riskLevel.toLowerCase().includes("high") ||
      riskLevel.toLowerCase().includes("critical")
    ) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else if (riskLevel.toLowerCase().includes("medium")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    } else {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "website":
        return "🌐";
      case "email":
        return "📧";
      case "socialmedia":
        return "📱";
      default:
        return "🔍";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Scam Detections
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              dataSource === "dynamodb"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {dataSource === "dynamodb" ? "🔴 Live Data" : "🧪 Test Data"}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Target/Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Detected
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.recentDetections.slice(0, 15).map((detection) => (
                <tr
                  key={detection.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {getContentTypeIcon(detection.content_type)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {detection.content_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(
                        detection.risk_level
                      )}`}
                    >
                      {detection.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                    <div className="text-sm text-gray-900 dark:text-white truncate">
                      {detection.domain || detection.platform || "N/A"}
                    </div>
                    {detection.url && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {detection.url}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {detection.detected_language.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(detection.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Regional Insights Section
const LanguageInsightsSection: React.FC<SectionProps> = ({
  data,
  dataSource,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Southeast Asia Regional Insights
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            dataSource === "dynamodb"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {dataSource === "dynamodb" ? "🔴 Live Data" : "🧪 Test Data"}
        </span>
      </div>

      {/* Regional Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.languageInsights.map((language) => (
          <div
            key={language.languageCode}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🌐</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language.language}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language.detections.toLocaleString()} detections
                  </p>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  language.trend === "up"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : language.trend === "down"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {language.trend === "up"
                  ? "📈"
                  : language.trend === "down"
                  ? "📉"
                  : "➡️"}{" "}
                {language.trendPercentage}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  High Risk:
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {language.highRisk.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (language.highRisk / language.detections) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Top Content Types:
                </p>
                <div className="flex flex-wrap gap-1">
                  {language.topContentTypes.map((contentType, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded"
                    >
                      {contentType.type} ({contentType.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Malicious Domains */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Malicious Domains
        </h4>
        <div className="space-y-3">
          {data.topDomains.slice(0, 10).map((domain, index) => (
            <div
              key={domain.domain}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-6">
                  {index + 1}.
                </span>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {domain.domain}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {domain.count} detections
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  domain.riskLevel.toLowerCase().includes("high") ||
                  domain.riskLevel.toLowerCase().includes("critical")
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : domain.riskLevel.toLowerCase().includes("medium")
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                }`}
              >
                {domain.riskLevel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Threat Analysis Section
const ThreatAnalysisSection: React.FC<SectionProps> = ({
  data,
  dataSource,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Threat Analysis & Patterns
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            dataSource === "dynamodb"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {dataSource === "dynamodb" ? "🔴 Live Analysis" : "🧪 Test Analysis"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Categories */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Threat Categories
          </h4>
          <div className="space-y-4">
            {[
              {
                category: "Website Scams",
                count: data.stats.websiteScams,
                icon: "🌐",
                percentage: (
                  (data.stats.websiteScams / data.stats.totalDetections) *
                  100
                ).toFixed(1),
              },
              {
                category: "Email Phishing",
                count: data.stats.emailScams,
                icon: "📧",
                percentage: (
                  (data.stats.emailScams / data.stats.totalDetections) *
                  100
                ).toFixed(1),
              },
              {
                category: "Social Media Scams",
                count: data.stats.socialMediaScams,
                icon: "📱",
                percentage: (
                  (data.stats.socialMediaScams / data.stats.totalDetections) *
                  100
                ).toFixed(1),
              },
            ].map((threat) => (
              <div
                key={threat.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{threat.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {threat.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {threat.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({threat.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Risk Assessment Summary
          </h4>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  🚨 Critical Threats
                </span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {data.stats.highRiskDetections.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300">
                {(
                  (data.stats.highRiskDetections / data.stats.totalDetections) *
                  100
                ).toFixed(1)}
                % of all detections
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                🎯 Most Targeted Countries
              </h5>
              <div className="space-y-1">
                {data.languageInsights.slice(0, 3).map((language, index) => (
                  <div
                    key={language.languageCode}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      {index + 1}. 🌐 {language.language}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {language.detections.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                🌐 Language Targeting
              </h5>
              <div className="space-y-1">
                {data.stats.topDetectedLanguages
                  .slice(0, 3)
                  .map((lang, index) => (
                    <div
                      key={lang.language}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-yellow-700 dark:text-yellow-300">
                        {index + 1}. {lang.language}
                      </span>
                      <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                        {lang.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Detection Samples */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent High-Risk Detection Samples
        </h4>
        <div className="space-y-4">
          {data.recentDetections
            .filter(
              (d) =>
                d.risk_level.toLowerCase().includes("high") ||
                d.risk_level.toLowerCase().includes("critical")
            )
            .slice(0, 3)
            .map((detection) => (
              <div
                key={detection.id}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {detection.content_type === "website"
                        ? "🌐"
                        : detection.content_type === "email"
                        ? "📧"
                        : "📱"}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        {detection.domain || detection.platform || "Unknown"}
                      </span>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {detection.detected_language.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    {detection.risk_level}
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 line-clamp-2">
                  {detection.analysis}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
