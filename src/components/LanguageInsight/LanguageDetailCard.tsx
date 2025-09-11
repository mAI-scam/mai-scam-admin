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
}

const LanguageDetailCard: React.FC<LanguageDetailCardProps> = ({
  countryDetails,
}) => {
  // Generate risk distribution data (mock data for now)
  const generateRiskDistribution = (
    totalDetections: number,
    riskLevel: "High" | "Medium" | "Low"
  ) => {
    // This is mock data - in a real implementation, you'd get this from the actual detection data
    const distributions = {
      High: [
        { level: "Low" as const, count: Math.floor(totalDetections * 0.2) },
        { level: "Medium" as const, count: Math.floor(totalDetections * 0.3) },
        { level: "High" as const, count: Math.floor(totalDetections * 0.5) },
      ],
      Medium: [
        { level: "Low" as const, count: Math.floor(totalDetections * 0.4) },
        { level: "Medium" as const, count: Math.floor(totalDetections * 0.5) },
        { level: "High" as const, count: Math.floor(totalDetections * 0.1) },
      ],
      Low: [
        { level: "Low" as const, count: Math.floor(totalDetections * 0.6) },
        { level: "Medium" as const, count: Math.floor(totalDetections * 0.3) },
        { level: "High" as const, count: Math.floor(totalDetections * 0.1) },
      ],
    };
    return distributions[riskLevel];
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-full">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col relative">
        {countryDetails ? (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Primary Country */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              {/* 1st Row: Flag and Country Information */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">
                  {getCountryInfo(countryDetails.name).flag}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {countryDetails.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getCountryInfo(countryDetails.name).population} people
                  </p>
                </div>
              </div>

              {/* 2nd Row: 3 Equal Width Items */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Detections
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {countryDetails.detections}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Percentage
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {countryDetails.percentage}%
                  </div>
                </div>
                <div
                  className={`p-2 rounded-lg text-center ${getRiskColor(
                    countryDetails.riskLevel
                  )}`}
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Risk Level
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {countryDetails.riskLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Possible Countries */}
            {countryDetails.possibleCountries.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Other Possible Countries
                </h4>
                <div className="flex flex-wrap gap-2">
                  {countryDetails.possibleCountries.slice(1).map((country) => (
                    <div
                      key={country}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-[50%] flex-1"
                    >
                      <span className="text-sm">
                        {getCountryInfo(country).flag}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {country}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {getCountryInfo(country).population} people
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Level Distribution - Full Width */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Risk Level Distribution
              </h4>
              <div className="h-24 w-full">
                {(() => {
                  const riskDistribution = generateRiskDistribution(
                    countryDetails.detections,
                    countryDetails.riskLevel
                  );

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
                        grid: {
                          color: "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: "#6B7280",
                          font: {
                            size: 10,
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
              Select a language to view country analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageDetailCard;
