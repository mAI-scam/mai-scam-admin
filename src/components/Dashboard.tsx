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
  ChartEvent,
  ActiveElement,
  TooltipItem,
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

  // Filter states for detections
  const [typeFilters, setTypeFilters] = useState({
    website: true,
    email: true,
    socialmedia: true,
  });
  const [riskFilters, setRiskFilters] = useState({
    high: true,
    medium: true,
    low: true,
  });
  const [languageFilters, setLanguageFilters] = useState({
    zh: true,
    ms: true,
    en: true,
  });

  // Pagination states for detections
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [itemsPerPage] = useState(10);
  const [dataSource, setDataSource] = useState<"dummy" | "dynamodb">("dummy");
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const navigation = [
    { name: "Overview", id: "overview", icon: "🛡️" },
    { name: "Detection Log", id: "detections", icon: "🔍" },
    { name: "Language Insights", id: "language", icon: "🌐" },
    { name: "Threat Analysis", id: "threats", icon: "⚠️" },
  ];

  const loadDashboardData = React.useCallback(
    async (isRefresh = false) => {
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
    },
    [user, hasLoadedData]
  );

  useEffect(() => {
    // Reset the loaded data flag when user changes
    setHasLoadedData(false);
    loadDashboardData();
  }, [user, loadDashboardData]);

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

  const navigateToDetectionsWithFilter = (
    typeFilter?: string,
    riskFilter?: string,
    languageFilter?: string
  ) => {
    // Set active section to detections
    setActiveSection("detections");

    // Reset filters to default "all selected" state
    setTypeFilters({ website: true, email: true, socialmedia: true });
    setRiskFilters({ high: true, medium: true, low: true });
    setLanguageFilters({ zh: true, ms: true, en: true });

    // Apply specific filters if provided
    if (typeFilter) {
      // Set only the specified type to true, others to false
      setTypeFilters({
        website: typeFilter === "website",
        email: typeFilter === "email",
        socialmedia: typeFilter === "socialmedia",
      });
    }
    if (riskFilter) {
      // Set only the specified risk to true, others to false
      setRiskFilters({
        high: riskFilter === "high",
        medium: riskFilter === "medium",
        low: riskFilter === "low",
      });
    }
    if (languageFilter) {
      // Set only the specified language to true, others to false
      setLanguageFilters({
        zh: languageFilter === "zh",
        ms: languageFilter === "ms",
        en: languageFilter === "en",
      });
    }

    // Reset pagination
    setCurrentPage(1);
    setPageInput("1");
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
        return (
          <OverviewSection
            {...sectionProps}
            navigateToDetectionsWithFilter={navigateToDetectionsWithFilter}
          />
        );
      case "detections":
        return (
          <DetectionsSection
            {...sectionProps}
            typeFilters={typeFilters}
            setTypeFilters={setTypeFilters}
            riskFilters={riskFilters}
            setRiskFilters={setRiskFilters}
            languageFilters={languageFilters}
            setLanguageFilters={setLanguageFilters}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageInput={pageInput}
            setPageInput={setPageInput}
            itemsPerPage={itemsPerPage}
          />
        );
      case "language":
        return <LanguageInsightsSection {...sectionProps} />;
      case "threats":
        return <ThreatAnalysisSection {...sectionProps} />;
      default:
        return (
          <OverviewSection
            {...sectionProps}
            navigateToDetectionsWithFilter={navigateToDetectionsWithFilter}
          />
        );
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

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {activeSection === "detections"
                  ? "Detection Log"
                  : activeSection.charAt(0).toUpperCase() +
                    activeSection.slice(1)}
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
const OverviewSection: React.FC<
  SectionProps & {
    navigateToDetectionsWithFilter: (
      typeFilter?: string,
      riskFilter?: string,
      languageFilter?: string
    ) => void;
  }
> = ({ data, isRefreshing, navigateToDetectionsWithFilter }) => {
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
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              if (stat.name === "Total Detections") {
                navigateToDetectionsWithFilter();
              } else if (stat.name === "Website Scams") {
                navigateToDetectionsWithFilter("website");
              } else if (stat.name === "Email Phishing") {
                navigateToDetectionsWithFilter("email");
              } else if (stat.name === "Social Media X") {
                navigateToDetectionsWithFilter("socialmedia");
              }
            }}
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
                onClick: (event: ChartEvent, elements: ActiveElement[]) => {
                  if (elements.length > 0) {
                    const elementIndex = elements[0].index;
                    const risk = orderedRisks[elementIndex];
                    if (risk) {
                      const riskLevel =
                        risk.risk.toLowerCase().includes("high") ||
                        risk.risk.toLowerCase().includes("critical")
                          ? "high"
                          : risk.risk.toLowerCase().includes("medium")
                          ? "medium"
                          : "low";
                      navigateToDetectionsWithFilter(undefined, riskLevel);
                    }
                  }
                },
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
                      label: function (context: TooltipItem<"bar">) {
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
                onClick: (event: ChartEvent, elements: ActiveElement[]) => {
                  if (elements.length > 0) {
                    const elementIndex = elements[0].index;
                    const language = topLanguages[elementIndex];
                    if (language) {
                      navigateToDetectionsWithFilter(
                        undefined,
                        undefined,
                        language.languageCode
                      );
                    }
                  }
                },
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
                      label: function (context: TooltipItem<"pie">) {
                        const language = topLanguages[context.dataIndex];
                        const percentage = (
                          (language.detections / totalDetections) *
                          100
                        ).toFixed(1);
                        return `${
                          language.language
                        }: ${language.detections.toLocaleString()} detections (${percentage}%)`;
                      },
                      afterLabel: function (context: TooltipItem<"pie">) {
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

// Detection Log Section
const DetectionsSection: React.FC<
  SectionProps & {
    typeFilters: { website: boolean; email: boolean; socialmedia: boolean };
    setTypeFilters: React.Dispatch<
      React.SetStateAction<{
        website: boolean;
        email: boolean;
        socialmedia: boolean;
      }>
    >;
    riskFilters: { high: boolean; medium: boolean; low: boolean };
    setRiskFilters: React.Dispatch<
      React.SetStateAction<{ high: boolean; medium: boolean; low: boolean }>
    >;
    languageFilters: { zh: boolean; ms: boolean; en: boolean };
    setLanguageFilters: React.Dispatch<
      React.SetStateAction<{ zh: boolean; ms: boolean; en: boolean }>
    >;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    pageInput: string;
    setPageInput: React.Dispatch<React.SetStateAction<string>>;
    itemsPerPage: number;
  }
> = ({
  data,
  typeFilters,
  setTypeFilters,
  riskFilters,
  setRiskFilters,
  languageFilters,
  setLanguageFilters,
  currentPage,
  setCurrentPage,
  pageInput,
  setPageInput,
  itemsPerPage,
}) => {
  // Sorting states
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");

  // Filter popup states
  const [openFilterPopup, setOpenFilterPopup] = useState<
    "type" | "risk" | "language" | null
  >(null);
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");
  const [filterButtonRefs, setFilterButtonRefs] = useState<{
    [key: string]: HTMLButtonElement | null;
  }>({});

  // Initialize language filters

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

  const getRiskLevel = (riskLevel: string) => {
    if (
      riskLevel.toLowerCase().includes("high") ||
      riskLevel.toLowerCase().includes("critical")
    ) {
      return "high";
    } else if (riskLevel.toLowerCase().includes("medium")) {
      return "medium";
    } else {
      return "low";
    }
  };

  // Filter and sort data
  const filteredAndSortedDetections = React.useMemo(() => {
    const filtered = data.recentDetections.filter((detection) => {
      // Type filter
      const typeMatch =
        typeFilters[detection.content_type as keyof typeof typeFilters];
      if (!typeMatch) return false;

      // Risk level filter
      const riskLevel = getRiskLevel(detection.risk_level);
      const riskMatch = riskFilters[riskLevel as keyof typeof riskFilters];
      if (!riskMatch) return false;

      // Language filter
      const languageMatch =
        languageFilters[
          detection.detected_language as keyof typeof languageFilters
        ];
      if (!languageMatch) return false;

      return true;
    });

    // Sort by date only
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateSortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [
    data.recentDetections,
    typeFilters,
    riskFilters,
    languageFilters,
    dateSortOrder,
  ]);

  const totalPages = Math.ceil(
    filteredAndSortedDetections.length / itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleTypeFilterChange = (type: keyof typeof typeFilters) => {
    setTypeFilters((prev) => ({ ...prev, [type]: !prev[type] }));
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleRiskFilterChange = (risk: keyof typeof riskFilters) => {
    setRiskFilters((prev) => ({ ...prev, [risk]: !prev[risk] }));
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleLanguageFilterChange = (language: string) => {
    setLanguageFilters((prev) => ({
      ...prev,
      [language]: !prev[language as keyof typeof prev],
    }));
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleDateSort = () => {
    setDateSortOrder(dateSortOrder === "desc" ? "asc" : "desc");
    setCurrentPage(1);
    setPageInput("1");
  };

  const getDateSortIcon = () => {
    return dateSortOrder === "desc" ? (
      <svg
        className="w-3 h-3 text-blue-600 dark:text-blue-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5 8l5 5 5-5H5z" />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 text-blue-600 dark:text-blue-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5 12l5-5 5 5H5z" />
      </svg>
    );
  };

  const toggleFilterPopup = (filterType: "type" | "risk" | "language") => {
    setOpenFilterPopup(openFilterPopup === filterType ? null : filterType);
    if (filterType === "language") {
      setLanguageSearchTerm(""); // Reset search when opening language filter
    }
  };

  const getFilteredLanguages = () => {
    const languageMap = {
      zh: "Chinese",
      ms: "Malay (Bahasa)",
      en: "English",
    };
    const languages = Object.keys(languageFilters);
    if (!languageSearchTerm) return languages;
    return languages.filter((lang) =>
      languageMap[lang as keyof typeof languageMap]
        .toLowerCase()
        .includes(languageSearchTerm.toLowerCase())
    );
  };

  // Memoized ref callbacks to prevent infinite loops
  const setTypeRef = React.useCallback((el: HTMLButtonElement | null) => {
    setFilterButtonRefs((prev) => ({ ...prev, type: el }));
  }, []);

  const setRiskRef = React.useCallback((el: HTMLButtonElement | null) => {
    setFilterButtonRefs((prev) => ({ ...prev, risk: el }));
  }, []);

  const setLanguageRef = React.useCallback((el: HTMLButtonElement | null) => {
    setFilterButtonRefs((prev) => ({ ...prev, language: el }));
  }, []);

  // Select All / Clear All logic
  const handleSelectAllType = () => {
    const allSelected = Object.values(typeFilters).every((v) => v);
    const newFilters = Object.keys(typeFilters).reduce((acc, key) => {
      acc[key as keyof typeof typeFilters] = !allSelected;
      return acc;
    }, {} as typeof typeFilters);
    setTypeFilters(newFilters);
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleSelectAllRisk = () => {
    const allSelected = Object.values(riskFilters).every((v) => v);
    const newFilters = Object.keys(riskFilters).reduce((acc, key) => {
      acc[key as keyof typeof riskFilters] = !allSelected;
      return acc;
    }, {} as typeof riskFilters);
    setRiskFilters(newFilters);
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleSelectAllLanguage = () => {
    const allSelected = Object.values(languageFilters).every((v) => v);
    setLanguageFilters({
      zh: !allSelected,
      ms: !allSelected,
      en: !allSelected,
    });
    setCurrentPage(1);
    setPageInput("1");
  };

  const getFilterIcon = (filterType: "type" | "risk" | "language") => {
    const hasActiveFilters =
      filterType === "type"
        ? Object.values(typeFilters).some((v) => !v)
        : filterType === "risk"
        ? Object.values(riskFilters).some((v) => !v)
        : Object.values(languageFilters).some((v) => !v);

    return (
      <svg
        className={`w-3 h-3 ${
          hasActiveFilters
            ? "text-orange-600 dark:text-orange-400"
            : "text-gray-400"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDetections = filteredAndSortedDetections.slice(
    startIndex,
    endIndex
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Table */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        <button
                          ref={setTypeRef}
                          onClick={() => toggleFilterPopup("type")}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Filter by Type"
                        >
                          {getFilterIcon("type")}
                        </button>
                      </div>
                    </th>
                    <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <span>Target / Domain</span>
                    </th>
                    <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Risk Level</span>
                        <button
                          ref={setRiskRef}
                          onClick={() => toggleFilterPopup("risk")}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Filter by Risk Level"
                        >
                          {getFilterIcon("risk")}
                        </button>
                      </div>
                    </th>
                    <th className="w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Language</span>
                        <button
                          ref={setLanguageRef}
                          onClick={() => toggleFilterPopup("language")}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Filter by Language"
                        >
                          {getFilterIcon("language")}
                        </button>
                      </div>
                    </th>
                    <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Detected Date & Time</span>
                        <button
                          onClick={handleDateSort}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Sort by Date & Time"
                        >
                          {getDateSortIcon()}
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentDetections.map((detection) => (
                    <tr
                      key={detection.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="w-24 px-3 py-2">
                        <div className="flex items-center">
                          <span className="text-sm mr-1">
                            {getContentTypeIcon(detection.content_type)}
                          </span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                            {detection.content_type === "socialmedia"
                              ? "Social Media"
                              : detection.content_type}
                          </span>
                        </div>
                      </td>
                      <td className="w-48 px-3 py-2">
                        {detection.content_type === "email" ? (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Information Hidden
                          </div>
                        ) : (
                          <div className="text-xs text-gray-900 dark:text-white truncate">
                            {detection.domain || detection.platform || "N/A"}
                          </div>
                        )}
                      </td>
                      <td className="w-24 px-3 py-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(
                            detection.risk_level
                          )}`}
                        >
                          {detection.risk_level}
                        </span>
                      </td>
                      <td className="w-20 px-3 py-2 text-xs text-gray-900 dark:text-white">
                        {detection.detected_language.toUpperCase()}
                      </td>
                      <td className="w-40 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(detection.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter Dropdown Overlays */}
          {openFilterPopup && filterButtonRefs[openFilterPopup] && (
            <div
              className="fixed z-50"
              style={{
                top:
                  filterButtonRefs[openFilterPopup]!.getBoundingClientRect()
                    .bottom +
                  window.scrollY +
                  4,
                left:
                  filterButtonRefs[openFilterPopup]!.getBoundingClientRect()
                    .left +
                  window.scrollX -
                  8,
                width: Math.max(
                  200,
                  filterButtonRefs[openFilterPopup]!.getBoundingClientRect()
                    .width + 16
                ),
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Filter by{" "}
                      {openFilterPopup === "type"
                        ? "Type"
                        : openFilterPopup === "risk"
                        ? "Risk Level"
                        : "Language"}
                    </h4>
                    <button
                      onClick={() => setOpenFilterPopup(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {openFilterPopup === "type" && (
                      <div className="space-y-2">
                        {/* Select All checkbox */}
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded border-b border-gray-200 dark:border-gray-600 pb-2">
                          <input
                            type="checkbox"
                            checked={Object.values(typeFilters).every((v) => v)}
                            onChange={handleSelectAllType}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {Object.values(typeFilters).every((v) => v)
                              ? "Clear All"
                              : "Select All"}
                          </span>
                        </label>

                        {Object.entries(typeFilters).map(([type, checked]) => (
                          <label
                            key={type}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                handleTypeFilterChange(
                                  type as keyof typeof typeFilters
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {type === "socialmedia" ? "Social Media" : type}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {openFilterPopup === "risk" && (
                      <div className="space-y-2">
                        {/* Select All checkbox */}
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded border-b border-gray-200 dark:border-gray-600 pb-2">
                          <input
                            type="checkbox"
                            checked={Object.values(riskFilters).every((v) => v)}
                            onChange={handleSelectAllRisk}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {Object.values(riskFilters).every((v) => v)
                              ? "Clear All"
                              : "Select All"}
                          </span>
                        </label>

                        {Object.entries(riskFilters).map(([risk, checked]) => (
                          <label
                            key={risk}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                handleRiskFilterChange(
                                  risk as keyof typeof riskFilters
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              <span
                                className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                  risk === "high"
                                    ? "bg-red-500"
                                    : risk === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              ></span>
                              {risk}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {openFilterPopup === "language" && (
                      <div className="space-y-2">
                        <div className="relative mb-2">
                          <input
                            type="text"
                            placeholder="Search languages..."
                            value={languageSearchTerm}
                            onChange={(e) =>
                              setLanguageSearchTerm(e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <svg
                            className="absolute right-3 top-2.5 w-4 h-4 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>

                        {/* Select All checkbox */}
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded border-b border-gray-200 dark:border-gray-600 pb-2">
                          <input
                            type="checkbox"
                            checked={Object.values(languageFilters).every(
                              (v) => v
                            )}
                            onChange={handleSelectAllLanguage}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {Object.values(languageFilters).every((v) => v)
                              ? "Clear All"
                              : "Select All"}
                          </span>
                        </label>

                        {getFilteredLanguages().map((language) => {
                          const languageMap = {
                            zh: "Chinese",
                            ms: "Malay (Bahasa)",
                            en: "English",
                          };
                          return (
                            <label
                              key={language}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  languageFilters[
                                    language as keyof typeof languageFilters
                                  ]
                                }
                                onChange={() =>
                                  handleLanguageFilterChange(language)
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {
                                  languageMap[
                                    language as keyof typeof languageMap
                                  ]
                                }
                              </span>
                            </label>
                          );
                        })}
                        {getFilteredLanguages().length === 0 &&
                          languageSearchTerm && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                              No languages found matching &quot;
                              {languageSearchTerm}&quot;
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredAndSortedDetections.length)} of{" "}
                  {filteredAndSortedDetections.length} detections
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => handlePageInputChange(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handlePageInputSubmit()
                    }
                    onBlur={handlePageInputSubmit}
                    className="w-16 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
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
