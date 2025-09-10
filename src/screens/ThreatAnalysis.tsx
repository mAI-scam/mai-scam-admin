"use client";

import React from "react";
import { DashboardData } from "@/data/dummyDynamoDbData";

interface SectionProps {
  data: DashboardData;
  authType: "test" | "google";
  isRefreshing?: boolean;
}

const ThreatAnalysis: React.FC<SectionProps> = ({
  data,
  authType,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Threat Analysis & Patterns
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            authType === "google"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {authType === "google" ? "🔴 Live Analysis" : "🧪 Test Analysis"}
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
                        {(() => {
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
                          return (
                            languageMap[detection.detected_language] ||
                            detection.detected_language.toUpperCase()
                          );
                        })()}
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

export default ThreatAnalysis;
