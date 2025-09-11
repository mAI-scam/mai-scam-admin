"use client";

import React from "react";
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
import { DashboardData } from "@/data/dummyDynamoDbData";
import { getLanguageDisplayName } from "@/data/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SectionProps {
  data: DashboardData;
  authType: "test" | "google";
  isRefreshing?: boolean;
}

interface OverviewProps extends SectionProps {
  navigateToDetectionsWithFilter: (
    typeFilter?: string,
    riskFilter?: string,
    languageFilter?: string
  ) => void;
  getLanguageDisplayName: (languageCode: string) => string;
}

const Overview: React.FC<OverviewProps> = ({
  data,
  isRefreshing,
  navigateToDetectionsWithFilter,
  getLanguageDisplayName,
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

export default Overview;
