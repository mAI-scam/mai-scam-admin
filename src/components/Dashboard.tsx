"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getDummyData, DashboardData } from "@/data/dummyDynamoDbData";
import {
  fetchDashboardDataFromAPI,
  checkDynamoDBConfiguration,
} from "@/lib/dashboardApi";
import SignIn from "@/screens/Signin";
import Overview from "@/screens/Overview";
import DetectionLog from "@/screens/DetectionLog";
import LanguageInsight from "@/screens/LanguageInsight";
import ThreatAnalysis from "@/screens/ThreatAnalysis";

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const itemsPerPage = 10;

  const loadDashboardData = React.useCallback(async () => {
    if (!user) return;

    try {
      setIsRefreshing(true);
      let data: DashboardData;

      if (user.authType === "google" && (await checkDynamoDBConfiguration())) {
        const apiData = await fetchDashboardDataFromAPI();
        data = apiData || (await getDummyData());
      } else {
        data = await getDummyData();
      }

      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to dummy data on error
      setDashboardData(await getDummyData());
    } finally {
      setIsRefreshing(false);
      setIsInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getLanguageDisplayName = (languageCode: string) => {
    const languageMap: { [key: string]: string } = {
      zh: "Chinese",
      ms: "Malay (Bahasa)",
      en: "English",
      vi: "Vietnamese",
      th: "Thai",
      id: "Indonesian",
      tl: "Filipino (Tagalog)",
      my: "Myanmar (Burmese)",
      km: "Khmer (Cambodian)",
      lo: "Lao",
      si: "Sinhala",
      ta: "Tamil",
      hi: "Hindi",
      ja: "Japanese",
      ko: "Korean",
    };
    return languageMap[languageCode] || languageCode.toUpperCase();
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

  const handleRefresh = () => {
    loadDashboardData();
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return "Overview";
      case "detections":
        return "Detection Log";
      case "language":
        return "Language Insights";
      case "threats":
        return "Threat Analysis";
      default:
        return "Overview";
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

    switch (activeSection) {
      case "overview":
        return (
          <Overview
            {...sectionProps}
            navigateToDetectionsWithFilter={navigateToDetectionsWithFilter}
            getLanguageDisplayName={getLanguageDisplayName}
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
          />
        );
      case "language":
        return <LanguageInsight {...sectionProps} />;
      case "threats":
        return <ThreatAnalysis {...sectionProps} />;
      default:
        return (
          <Overview
            {...sectionProps}
            navigateToDetectionsWithFilter={navigateToDetectionsWithFilter}
            getLanguageDisplayName={getLanguageDisplayName}
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
              { id: "threats", name: "Threat Analysis", icon: "⚠️" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
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
                onClick={() => setSidebarOpen(true)}
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getSectionTitle()}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-2">
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
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-hidden p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
