"use client";

import React from "react";
import { DashboardData } from "@/data/dummyDynamoDbData";

interface SectionProps {
  data: DashboardData;
  authType: "test" | "google";
  isRefreshing?: boolean;
}

const LanguageInsight: React.FC<SectionProps> = ({
  data,
  authType,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Southeast Asia Regional Insights
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            authType === "google"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {authType === "google" ? "🔴 Live Data" : "🧪 Test Data"}
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

export default LanguageInsight;
