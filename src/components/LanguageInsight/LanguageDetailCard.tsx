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
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getCountryInfo, getRiskColor } from "@/data/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CountryDetails {
  name: string;
  language: string;
  detections: number;
  percentage: number;
  riskLevel: "High" | "Medium" | "Low";
  possibleCountries: string[];
  contentTypes: { type: string; count: number }[];
  riskDistribution: { level: "Low" | "Medium" | "High"; count: number }[];
}

interface LanguageDetailCardProps {
  countryDetails: CountryDetails | null;
  maxRiskDistributionValue?: number;
}

const LanguageDetailCard: React.FC<LanguageDetailCardProps> = ({
  countryDetails,
  maxRiskDistributionValue = 100,
}) => {
  // Use actual risk distribution data from the props
  const getRiskDistribution = () => {
    if (!countryDetails?.riskDistribution) {
      // Fallback to empty distribution if no data is available
      return [
        { level: "Low" as const, count: 0 },
        { level: "Medium" as const, count: 0 },
        { level: "High" as const, count: 0 },
      ];
    }
    return countryDetails.riskDistribution;
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-full">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col relative">
        {countryDetails ? (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Language Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {countryDetails.language}
              </h2>
            </div>

            {/* Language Details */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              {/* 2 Equal Width Items */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center relative">
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center">
                    Risk Score
                    <div className="relative ml-1 group">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        <div className="text-center">
                          <div className="font-semibold mb-1">
                            Risk Score Calculation:
                          </div>
                          <div>High Risk = 3 points</div>
                          <div>Medium Risk = 2 points</div>
                          <div>Low Risk = 1 point</div>
                          <div className="mt-1 pt-1 border-t border-gray-600">
                            Score = (High×3 + Medium×2 + Low×1) ÷ Total
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {(() => {
                      const distribution = getRiskDistribution();
                      const totalDetections = countryDetails.detections;
                      if (totalDetections === 0) return "0.0";

                      const lowCount =
                        distribution.find((d) => d.level === "Low")?.count || 0;
                      const mediumCount =
                        distribution.find((d) => d.level === "Medium")?.count ||
                        0;
                      const highCount =
                        distribution.find((d) => d.level === "High")?.count ||
                        0;

                      const weightedScore =
                        (highCount * 3 + mediumCount * 2 + lowCount * 1) /
                        totalDetections;
                      return weightedScore.toFixed(1);
                    })()}
                  </div>
                </div>
                <div
                  className={`p-2 rounded-lg text-center relative ${getRiskColor(
                    countryDetails.riskLevel
                  )}`}
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center">
                    Risk Level
                    <div className="relative ml-1 group">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        <div className="text-center">
                          <div className="font-semibold mb-1">
                            Risk Level Thresholds:
                          </div>
                          <div>High Risk: Score ≥ 2.2</div>
                          <div>Medium Risk: Score 1.8 - 2.1</div>
                          <div>Low Risk: Score &lt; 1.8</div>
                          <div className="mt-1 pt-1 border-t border-gray-600">
                            Based on weighted scoring
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {countryDetails.riskLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Distribution - Full Width and Remaining Height */}
            <div className="flex-1 flex flex-col">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Risk Level Distribution
              </h4>
              <div className="flex-1 w-full">
                {(() => {
                  const riskDistribution = getRiskDistribution();

                  // Find the risk level with the most count
                  const maxCount = Math.max(
                    ...riskDistribution.map((r) => r.count)
                  );
                  const dominantRisk = riskDistribution.find(
                    (r) => r.count === maxCount
                  )?.level;

                  const chartData = {
                    labels: riskDistribution.map((r) => r.level),
                    datasets: [
                      {
                        label: "Count",
                        data: riskDistribution.map((r) => r.count),
                        backgroundColor: riskDistribution.map((r) =>
                          r.level === dominantRisk
                            ? r.level === "High"
                              ? "#DC2626"
                              : r.level === "Medium"
                              ? "#F59E0B"
                              : "#059669"
                            : "#9CA3AF"
                        ),
                        borderColor: riskDistribution.map((r) =>
                          r.level === dominantRisk
                            ? r.level === "High"
                              ? "#DC2626"
                              : r.level === "Medium"
                              ? "#F59E0B"
                              : "#059669"
                            : "#9CA3AF"
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
                    // Set fixed width to prevent chart from changing size
                    aspectRatio: 3, // This ensures consistent width regardless of data points
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
                          label: function (context: { dataIndex: number }) {
                            const risk = riskDistribution[context.dataIndex];
                            return `${risk.level}: ${risk.count} detections`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: maxRiskDistributionValue,
                        grid: {
                          color: "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: "#6B7280",
                          font: {
                            size: 10,
                          },
                          stepSize: Math.ceil(maxRiskDistributionValue / 5), // 5 tick marks
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: "#6B7280",
                          font: {
                            size: 10,
                          },
                        },
                        // Fixed category width to prevent expansion
                        categoryPercentage: 0.6,
                        barPercentage: 0.8,
                      },
                    },
                    // Fixed bar width to prevent expansion
                    barThickness: 25,
                    maxBarThickness: 25,
                    interaction: {
                      intersect: false,
                      mode: "index" as const,
                    },
                  };

                  return <Bar data={chartData} options={options} />;
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🌐</div>
            <p className="text-gray-600 dark:text-gray-400">
              Select a language to view analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageDetailCard;
