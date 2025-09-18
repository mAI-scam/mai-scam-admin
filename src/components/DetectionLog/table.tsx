"use client";

import React, { useState } from "react";
import { DashboardData } from "@/data/dummyDynamoDbData";
import {
  LANGUAGE_ABBREVIATIONS,
  getContentTypeDisplayName,
} from "@/data/constants";
import ItemsPerPageSelector from "./ItemsPerPageSelector";

// Updated interface with pagination support

interface DetectionTableProps {
  data: DashboardData;
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
  languageFilters: { [key: string]: boolean };
  setLanguageFilters: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageInput: string;
  setPageInput: React.Dispatch<React.SetStateAction<string>>;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  getLanguageDisplayName: (languageCode: string) => string;
  onRowClick?: (detection: DashboardData["recentDetections"][0]) => void;
  pagination?: {
    hasMore: boolean;
    lastEvaluatedKey?: Record<string, unknown>;
    scannedCount: number;
    count: number;
  } | null;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreError?: string | null;
}

const DetectionTable: React.FC<DetectionTableProps> = ({
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
  onItemsPerPageChange,
  getLanguageDisplayName,
  onRowClick,
  pagination,
  isLoadingMore,
  onLoadMore,
  loadMoreError,
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
    const languages = Object.keys(languageFilters);
    if (!languageSearchTerm) return languages;
    return languages.filter((lang) =>
      LANGUAGE_ABBREVIATIONS[lang]
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
    const newFilters: { [key: string]: boolean } = {};
    Object.keys(languageFilters).forEach((lang) => {
      newFilters[lang] = !allSelected;
    });
    setLanguageFilters(newFilters);
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
                  <th className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => onRowClick && onRowClick(detection)}
                  >
                    <td className="w-24 px-3 py-2">
                      <div className="flex items-center">
                        <span className="text-sm mr-1">
                          {getContentTypeIcon(detection.content_type)}
                        </span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {getContentTypeDisplayName(detection.content_type)}
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
                    <td className="w-32 px-3 py-2 text-xs text-gray-900 dark:text-white">
                      {getLanguageDisplayName(detection.detected_language)}
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
                        return (
                          <label
                            key={language}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={languageFilters[language]}
                              onChange={() =>
                                handleLanguageFilterChange(language)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {LANGUAGE_ABBREVIATIONS[language]}
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredAndSortedDetections.length)} of{" "}
                {filteredAndSortedDetections.length} detections
                {pagination && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    (Total scanned: {pagination.scannedCount})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Simple fallback selector */}
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
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

              {/* Load More Button for Server-side Pagination */}
              {pagination?.hasMore && onLoadMore && (
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1 inline-block"></div>
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              )}

              {/* Error Message */}
              {loadMoreError && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  {loadMoreError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionTable;
