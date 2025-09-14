"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getDummyData, DashboardData } from "@/data/dummyDynamoDbData";
import {
  fetchDashboardDataFromAPI,
  checkDynamoDBConfiguration,
} from "@/lib/dashboardApi";
import { getLanguageDisplayName, getPossibleCountries } from "@/data/constants";
import { LanguageInsight as ApiLanguageInsight } from "@/data/dummyDynamoDbData";
import Overview from "@/screens/Overview";
import DetectionLog from "@/screens/DetectionLog";
import LanguageInsight from "@/screens/LanguageInsight";
import WebsiteAnalysis from "@/screens/WebsiteAnalysis";
import EmailAnalysis from "@/screens/EmailAnalysis";
import SocialmediaAnalysis from "@/screens/SocialmediaAnalysis";
import Blacklist from "@/screens/Blacklist";

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<
    DashboardData["recentDetections"][0] | null
  >(null);
  const [analysisSource, setAnalysisSource] = useState<
    "detections" | "blacklist"
  >("detections");

  // Pagination states for server-side data
  const [pagination, setPagination] = useState<{
    hasMore: boolean;
    lastEvaluatedKey?: Record<string, unknown>;
    scannedCount: number;
    count: number;
  } | null>(null);
  const [allDetections, setAllDetections] = useState<
    DashboardData["recentDetections"]
  >([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

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
  const [languageFilters, setLanguageFilters] = useState<{
    [key: string]: boolean;
  }>({});

  // Function to generate language filters from actual data
  const generateLanguageFilters = (data: DashboardData) => {
    const availableLanguages = new Set<string>();

    // Get languages from recent detections
    data.recentDetections.forEach((detection) => {
      if (detection.detected_language) {
        availableLanguages.add(detection.detected_language);
      }
    });

    // Get languages from language insights
    data.languageInsights.forEach((insight) => {
      if (insight.languageCode) {
        availableLanguages.add(insight.languageCode);
      }
    });

    // Create filters with all available languages set to true
    const filters: { [key: string]: boolean } = {};
    availableLanguages.forEach((lang) => {
      filters[lang] = true;
    });

    return filters;
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const itemsPerPage = 10;

  // Pre-calculated language insights state
  const [processedLanguageInsights, setProcessedLanguageInsights] = useState<
    | {
        language: string;
        detections: number;
        percentage: number;
        riskLevel: "High" | "Medium" | "Low";
        possibleCountries: string[];
        riskDistribution?: {
          level: "Low" | "Medium" | "High";
          count: number;
        }[];
        topContentTypes?: { type: string; count: number }[];
      }[]
    | null
  >(null);

  const loadDashboardData = React.useCallback(
    async (reset: boolean = true) => {
      if (!user) return;

      try {
        setIsRefreshing(true);
        let data: DashboardData;
        let newPagination: {
          hasMore: boolean;
          lastEvaluatedKey?: Record<string, unknown>;
          scannedCount: number;
          count: number;
        } | null = null;

        if (
          user.authType === "google" &&
          (await checkDynamoDBConfiguration())
        ) {
          const result = await fetchDashboardDataFromAPI(1, 100);
          data = result.data || (await getDummyData());
          newPagination = result.pagination || null;

          // If we have pagination info, store all detections separately
          if (result.pagination && result.data) {
            if (reset) {
              setAllDetections(result.data.recentDetections);
            } else {
              setAllDetections((prev) => [
                ...prev,
                ...result.data!.recentDetections,
              ]);
            }
          }
        } else {
          data = await getDummyData();
          if (reset) {
            setAllDetections(data.recentDetections);
          }
        }

        setDashboardData(data);
        setPagination(newPagination);
        setLanguageFilters(generateLanguageFilters(data));

        // Pre-calculate language insights to avoid recalculation on navigation
        if (data.languageInsights && data.languageInsights.length > 0) {
          const totalDetections = data.languageInsights.reduce(
            (sum: number, insight: ApiLanguageInsight) =>
              sum + insight.detections,
            0
          );

          const processedInsights = data.languageInsights.map(
            (insight: ApiLanguageInsight) => {
              const percentage = (insight.detections / totalDetections) * 100;

              // Calculate risk level based on actual risk distribution within the language
              const distribution = insight.riskDistribution || [
                { level: "Low" as const, count: 0 },
                { level: "Medium" as const, count: 0 },
                { level: "High" as const, count: 0 },
              ];

              const totalDetectionsForLang = insight.detections;
              if (totalDetectionsForLang === 0) {
                return {
                  ...insight,
                  percentage: Math.round(percentage * 10) / 10,
                  riskLevel: "Low" as const,
                  possibleCountries: getPossibleCountries(insight.language),
                };
              }

              const lowCount =
                distribution.find((d) => d.level === "Low")?.count || 0;
              const mediumCount =
                distribution.find((d) => d.level === "Medium")?.count || 0;
              const highCount =
                distribution.find((d) => d.level === "High")?.count || 0;

              const mediumPercentage =
                (mediumCount / totalDetectionsForLang) * 100;
              const highPercentage = (highCount / totalDetectionsForLang) * 100;

              const weightedScore =
                (highCount * 3 + mediumCount * 2 + lowCount * 1) /
                totalDetectionsForLang;

              let riskLevel: "High" | "Medium" | "Low";
              if (highPercentage > 50) {
                riskLevel = "High";
              } else if (highPercentage > 30 || weightedScore > 2.2) {
                riskLevel = "High";
              } else if (
                mediumPercentage + highPercentage > 40 ||
                weightedScore > 1.8
              ) {
                riskLevel = "Medium";
              } else {
                riskLevel = "Low";
              }

              return {
                ...insight,
                percentage: Math.round(percentage * 10) / 10,
                riskLevel,
                possibleCountries: getPossibleCountries(insight.language),
              };
            }
          );

          setProcessedLanguageInsights(processedInsights);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Fallback to dummy data on error
        const fallbackData = await getDummyData();
        setDashboardData(fallbackData);
        setAllDetections(fallbackData.recentDetections);
        setPagination(null);
        setLanguageFilters(generateLanguageFilters(fallbackData));

        // Pre-calculate language insights for fallback data too
        if (
          fallbackData.languageInsights &&
          fallbackData.languageInsights.length > 0
        ) {
          const totalDetections = fallbackData.languageInsights.reduce(
            (sum: number, insight: ApiLanguageInsight) =>
              sum + insight.detections,
            0
          );

          const processedInsights = fallbackData.languageInsights.map(
            (insight: ApiLanguageInsight) => {
              const percentage = (insight.detections / totalDetections) * 100;

              const distribution = insight.riskDistribution || [
                { level: "Low" as const, count: 0 },
                { level: "Medium" as const, count: 0 },
                { level: "High" as const, count: 0 },
              ];

              const totalDetectionsForLang = insight.detections;
              if (totalDetectionsForLang === 0) {
                return {
                  ...insight,
                  percentage: Math.round(percentage * 10) / 10,
                  riskLevel: "Low" as const,
                  possibleCountries: getPossibleCountries(insight.language),
                };
              }

              const lowCount =
                distribution.find((d) => d.level === "Low")?.count || 0;
              const mediumCount =
                distribution.find((d) => d.level === "Medium")?.count || 0;
              const highCount =
                distribution.find((d) => d.level === "High")?.count || 0;

              const mediumPercentage =
                (mediumCount / totalDetectionsForLang) * 100;
              const highPercentage = (highCount / totalDetectionsForLang) * 100;

              const weightedScore =
                (highCount * 3 + mediumCount * 2 + lowCount * 1) /
                totalDetectionsForLang;

              let riskLevel: "High" | "Medium" | "Low";
              if (highPercentage > 50) {
                riskLevel = "High";
              } else if (highPercentage > 30 || weightedScore > 2.2) {
                riskLevel = "High";
              } else if (
                mediumPercentage + highPercentage > 40 ||
                weightedScore > 1.8
              ) {
                riskLevel = "Medium";
              } else {
                riskLevel = "Low";
              }

              return {
                ...insight,
                percentage: Math.round(percentage * 10) / 10,
                riskLevel,
                possibleCountries: getPossibleCountries(insight.language),
              };
            }
          );

          setProcessedLanguageInsights(processedInsights);
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [user]
  );

  const loadMoreData = React.useCallback(async () => {
    if (!user || !pagination?.hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      setLoadMoreError(null);
      const result = await fetchDashboardDataFromAPI(
        1,
        100,
        pagination.lastEvaluatedKey
      );

      if (result.data && result.pagination) {
        setAllDetections((prev) => [...prev, ...result.data!.recentDetections]);
        setPagination(result.pagination);

        // Update dashboard data with all detections
        const updatedData = {
          ...dashboardData!,
          recentDetections: [...allDetections, ...result.data.recentDetections],
        };
        setDashboardData(updatedData);
      } else {
        setLoadMoreError("No more data available or failed to load more data");
      }
    } catch (error) {
      console.error("Error loading more data:", error);
      setLoadMoreError("Failed to load more data. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, pagination, isLoadingMore, dashboardData, allDetections]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
    // Reset language filters to all available languages selected
    const resetLanguageFilters: { [key: string]: boolean } = {};
    Object.keys(languageFilters).forEach((lang) => {
      resetLanguageFilters[lang] = true;
    });
    setLanguageFilters(resetLanguageFilters);

    // Apply specific filters if provided
    if (typeFilter) {
      setTypeFilters({
        website: typeFilter === "website",
        email: typeFilter === "email",
        socialmedia: typeFilter === "socialmedia",
      });
    }

    if (riskFilter) {
      setRiskFilters({
        high: riskFilter === "high",
        medium: riskFilter === "medium",
        low: riskFilter === "low",
      });
    }

    if (languageFilter) {
      const filteredLanguageFilters: { [key: string]: boolean } = {};
      Object.keys(languageFilters).forEach((lang) => {
        filteredLanguageFilters[lang] = lang === languageFilter;
      });
      setLanguageFilters(filteredLanguageFilters);
    }

    // Reset pagination
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleOpenAnalysis = (
    detection: DashboardData["recentDetections"][0]
  ) => {
    setSelectedDetection(detection);
  };

  const handleOpenAnalysisFromBlacklist = (
    detection: DashboardData["recentDetections"][0]
  ) => {
    setSelectedDetection(detection);
    setAnalysisSource("blacklist");
  };

  const handleCloseAnalysis = () => {
    setSelectedDetection(null);
    setAnalysisSource("detections");
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return "Overview";
      case "detections":
        return "Detection Log";
      case "language":
        return "Language Insights";
      case "blacklist":
        return "Blacklist";
      default:
        return "Overview";
    }
  };

  const getSectionInfo = () => {
    switch (activeSection) {
      case "detections":
        return (
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full max-w-xs">
            A comprehensive list of all detections, with built-in filter
            function
          </div>
        );
      case "language":
        return (
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full max-w-xs">
            A weighted score between 1 (min.) to 3 (max.) to flag cyber threat
            trends across languages.
          </div>
        );
      case "blacklist":
        return (
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full max-w-xs">
            A glance of detected high-risk website URLs and social media images
          </div>
        );
      default:
        return null;
    }
  };

  const getDataSource = () => {
    if (!user) return "test";
    return user.authType === "google" ? "dynamodb" : "dummy";
  };

  const renderContent = () => {
    if (!dashboardData) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading dashboard data...
            </p>
          </div>
        </div>
      );
    }

    const sectionProps = {
      data: dashboardData,
      dataSource: getDataSource(),
      authType: user?.authType || "test",
      isRefreshing,
    };

    // Show analysis screen when selected detection exists
    if (selectedDetection) {
      const backButtonText =
        analysisSource === "blacklist"
          ? "Back to Blacklist"
          : "Back to Detection Log";

      if (selectedDetection.content_type === "website") {
        return (
          <WebsiteAnalysis
            detection={selectedDetection}
            onBack={handleCloseAnalysis}
            backButtonText={backButtonText}
          />
        );
      }
      if (selectedDetection.content_type === "email") {
        return (
          <EmailAnalysis
            detection={selectedDetection}
            onBack={handleCloseAnalysis}
          />
        );
      }
      return (
        <SocialmediaAnalysis
          detection={selectedDetection}
          onBack={handleCloseAnalysis}
          backButtonText={backButtonText}
        />
      );
    }

    switch (activeSection) {
      case "overview":
        return (
          <Overview
            {...sectionProps}
            navigateToDetectionsWithFilter={navigateToDetectionsWithFilter}
          />
        );
      case "detections":
        return (
          <DetectionLog
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
            getLanguageDisplayName={getLanguageDisplayName}
            onOpenAnalysis={handleOpenAnalysis}
            pagination={pagination}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreData}
            allDetections={allDetections}
            loadMoreError={loadMoreError}
          />
        );
      case "language":
        return (
          <LanguageInsight
            processedLanguageInsights={processedLanguageInsights}
          />
        );
      case "blacklist":
        return (
          <Blacklist
            data={dashboardData}
            onOpenAnalysis={handleOpenAnalysisFromBlacklist}
          />
        );
      default:
        return (
          <Overview
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
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="mAIscam Logo"
              width={32}
              height={32}
              className="mr-3"
            />
            <span className="text-xl font-bold">
              <span style={{ color: "#49A4EF" }}>m</span>
              <span style={{ color: "#EB6700" }}>AI</span>
              <span style={{ color: "#49A4EF" }}>scam</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {[
              { id: "overview", name: "Overview", icon: "📊" },
              { id: "detections", name: "Detection Log", icon: "🔍" },
              { id: "language", name: "Language Insights", icon: "🌐" },
              { id: "blacklist", name: "Blacklist", icon: "🚫" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedDetection(null);
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.authType === "google" ? "Google Auth" : "Test User"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Logout"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSelectedDetection(null);
                  setSidebarOpen(true);
                }}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white whitespace-nowrap w-48">
                  {getSectionTitle()}
                </h1>
                {getSectionInfo()}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getDataSource() === "dynamodb"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {getDataSource() === "dynamodb"
                  ? "🔴 Live Data"
                  : "🧪 Test Data"}
              </span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-hidden p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
